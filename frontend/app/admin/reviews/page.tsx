'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPendingReviews, approveReview, rejectReview } from '@/lib/api';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';
import { ArrowLeft, Check, X, Star, Building2, User, Clock, Mail, Calendar } from 'lucide-react';
import { UserIdDisplay } from '@/components/ui/UserIdDisplay';
import { AdminReviewSkeleton } from '@/components/ui/Skeletons';

interface PendingReview {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  company: {
    name: string;
    slug: string;
  };
}

const ITEMS_PER_PAGE = 20;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadReviews = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
        setReviews([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const data = await getPendingReviews({
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
      });
      
      if (reset) {
        setReviews(data);
      } else {
        setReviews(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const newItems = data.filter(r => !existingIds.has(r.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
      setOffset(currentOffset + data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadReviews(false);
    }
  };

  useEffect(() => {
    loadReviews(true);
  }, []);

  const handleApprove = async (reviewId: string) => {
    if (processingIds.has(reviewId)) return;
    
    try {
      setProcessingIds(prev => new Set(prev).add(reviewId));
      const result = await approveReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Відгук схвалено');
      if (result.companySlug) {
        await fetch(`/api/revalidate?tag=company:${result.companySlug}`, { method: 'POST' });
        await fetch(`/api/revalidate?tag=company:${result.companySlug}:reviews`, { method: 'POST' });
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(err.status, err.errorCode);
      toast[errorType](errorMessage);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    if (processingIds.has(reviewId)) return;
    
    try {
      setProcessingIds(prev => new Set(prev).add(reviewId));
      const result = await rejectReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Відгук відхилено');
      if (result.companySlug) {
        await fetch(`/api/revalidate?tag=company:${result.companySlug}`, { method: 'POST' });
        await fetch(`/api/revalidate?tag=company:${result.companySlug}:reviews`, { method: 'POST' });
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(err.status, err.errorCode);
      toast[errorType](errorMessage);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
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
            onClick={() => loadReviews(true)}
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Модерація відгуків</h1>
            <p className="text-slate-600">
              {loading
                ? 'Завантаження...'
                : reviews.length === 0
                ? 'Немає відгуків на модерацію'
                : `Всього відгуків на модерацію: ${reviews.length}`}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <AdminReviewSkeleton key={i} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Всі відгуки оброблено!</h2>
            <p className="text-slate-600">Немає відгуків, які потребують модерації.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="size-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shrink-0">
                        {review.user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 truncate break-words min-w-0">{review.user.name}</h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-slate-300'
                                }
                              />
                            ))}
                            <span className="ml-1 text-sm font-medium text-slate-700">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-2">
                          <div className="flex items-center gap-1 min-w-0">
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate break-all">{review.user.email}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Calendar size={12} className="shrink-0" />
                            <span>Реєстрація: {new Date(review.user.createdAt).toLocaleDateString('uk-UA')}</span>
                          </div>
                        </div>
                        <div className="mb-2">
                          <UserIdDisplay userId={review.user.id} variant="compact" />
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Building2 size={16} className="shrink-0" />
                            <span className="truncate break-words min-w-0">{review.company.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Clock size={16} className="shrink-0" />
                            <span>{new Date(review.createdAt).toLocaleDateString('uk-UA')}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 mb-4 overflow-hidden max-w-3xl">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                            {review.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 sm:w-full md:w-48 shrink-0">
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={processingIds.has(review.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingIds.has(review.id) ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Обробка...</span>
                        </>
                      ) : (
                        <>
                          <Check size={18} className="sm:w-5 sm:h-5" />
                          <span>Схвалити</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={processingIds.has(review.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingIds.has(review.id) ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Обробка...</span>
                        </>
                      ) : (
                        <>
                          <X size={18} className="sm:w-5 sm:h-5" />
                          <span>Відхилити</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && reviews.length > 0 && hasMore && (
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
    </div>
  );
}
