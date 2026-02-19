'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getReports, resolveReport } from '@/lib/api';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';
import { ArrowLeft, Check, X, Star, Building2, User, Clock, AlertTriangle, MessageSquare, Mail } from 'lucide-react';
import { UserIdDisplay } from '@/components/ui/UserIdDisplay';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminReportSkeleton } from '@/components/ui/Skeletons';

interface Report {
  id: string;
  reason: string;
  comment: string | null;
  createdAt: string;
  review: {
    id: string;
    text: string;
    rating: number;
    company: {
      name: string;
      slug: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Спам або реклама',
  hate: 'Образи / мова ворожнечі',
  false: 'Неправдива інформація',
  irrelevant: 'Не стосується об\'єкта',
  other: 'Інше',
};

const ITEMS_PER_PAGE = 20;

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    reportId: string | null;
    action: 'keep' | 'delete' | null;
  }>({
    isOpen: false,
    reportId: null,
    action: null,
  });

  const loadReports = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
        setReports([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const data = await getReports({
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
      });
      
      if (reset) {
        setReports(data);
      } else {
        setReports(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const newItems = data.filter(r => !existingIds.has(r.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
      setOffset(currentOffset + data.length);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadReports(false);
    }
  };

  useEffect(() => {
    loadReports(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResolveClick = (reportId: string, action: 'keep' | 'delete') => {
    if (resolvingIds.has(reportId)) return;
    setConfirmModal({
      isOpen: true,
      reportId,
      action,
    });
  };

  const handleResolve = async () => {
    if (!confirmModal.reportId || !confirmModal.action) return;

    const reportId = confirmModal.reportId;
    const action = confirmModal.action;

    try {
      setResolvingIds((prev) => new Set(prev).add(reportId));
      setConfirmModal({ isOpen: false, reportId: null, action: null });
      const result = await resolveReport(reportId, action);
      setReports(prev => prev.filter(r => r.id !== reportId));
      toast.success(action === 'delete' ? 'Відгук видалено' : 'Відгук залишено');
      if (result.companySlug) {
        await fetch(`/api/revalidate?tag=company:${result.companySlug}`, { method: 'POST' });
        await fetch(`/api/revalidate?tag=company:${result.companySlug}:reviews`, { method: 'POST' });
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(
        (err as { status?: number }).status,
        (err as { errorCode?: string }).errorCode
      );
      toast[errorType](errorMessage);
    } finally {
      setResolvingIds((prev) => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold mb-4">Помилка завантаження</p>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => loadReports(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад до панелі адміністратора</span>
          </Link>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Розгляд скарг</h1>
            <p className="text-slate-600">
              {loading
                ? 'Завантаження...'
                : reports.length === 0
                ? 'Немає скарг на розгляд'
                : `Всього скарг на розгляд: ${reports.length}`}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <AdminReportSkeleton key={i} />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Всі скарги оброблено!</h2>
            <p className="text-slate-600">Немає скарг, які потребують розгляду.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col gap-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <User size={16} className="text-slate-500 shrink-0" />
                          <span className="text-sm font-medium text-slate-700 truncate break-words min-w-0">
                            Скаргу подав: {report.user.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-2 text-xs text-slate-600 flex-wrap">
                          <div className="flex items-center gap-1 min-w-0">
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate break-all">{report.user.email}</span>
                          </div>
                          <UserIdDisplay userId={report.user.id} variant="compact" />
                        </div>
                        <div className="flex items-center gap-2 mb-2 min-w-0">
                          <span className="text-sm font-semibold text-orange-700 truncate break-words min-w-0">
                            Причина: {REASON_LABELS[report.reason] || report.reason}
                          </span>
                        </div>
                        {report.comment && (
                          <div className="mt-2 pt-2 border-t border-orange-200 overflow-hidden">
                            <p className="text-sm text-slate-700 break-words">
                              <span className="font-medium">Коментар:</span> {report.comment}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <Clock size={14} />
                          <span>{new Date(report.createdAt).toLocaleDateString('uk-UA')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 size={18} className="text-slate-500" />
                      <Link
                        href={`/company/${report.review.company.slug}`}
                        className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors truncate break-words min-w-0 flex-1 overflow-hidden"
                      >
                        {report.review.company.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= report.review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-slate-300'
                            }
                          />
                        ))}
                        <span className="ml-1 text-sm font-medium text-slate-700">
                          {report.review.rating}/5
                        </span>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-semibold text-red-700 shrink-0">Автор відгуку:</span>
                        <span className="text-sm font-medium text-slate-900 truncate break-words min-w-0">{report.review.user.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate break-all">{report.review.user.email}</span>
                        </div>
                        <UserIdDisplay userId={report.review.user.id} variant="compact" />
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 mb-4 overflow-hidden max-w-3xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} className="text-slate-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700">Текст відгуку:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                        {report.review.text}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleResolveClick(report.id, 'keep')}
                      disabled={resolvingIds.has(report.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <Check size={18} className="sm:w-5 sm:h-5" />
                      <span>Залишити відгук</span>
                    </button>
                    <button
                      onClick={() => handleResolveClick(report.id, 'delete')}
                      disabled={resolvingIds.has(report.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <X size={18} className="sm:w-5 sm:h-5" />
                      <span>Видалити відгук</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && reports.length > 0 && hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Завантаження...
                </>
              ) : (
                'Завантажити більше'
              )}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, reportId: null, action: null })}
        onConfirm={handleResolve}
        title={confirmModal.action === 'delete' ? 'Видалити відгук?' : 'Залишити відгук?'}
        message={confirmModal.action === 'delete' ? 'Ви впевнені, що хочете видалити цей відгук? Цю дію неможливо скасувати.' : 'Ви впевнені, що хочете залишити цей відгук?'}
        confirmText={confirmModal.action === 'delete' ? 'Видалити' : 'Залишити'}
        variant={confirmModal.action === 'delete' ? 'danger' : 'default'}
        loading={confirmModal.reportId ? resolvingIds.has(confirmModal.reportId) : false}
      />
    </div>
  );
}
