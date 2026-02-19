'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserDetails } from '@/lib/api';
import { toast } from '@/lib/toast';
import { ArrowLeft, User, Mail, Calendar, MessageSquare, CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, AlertCircle, Shield } from 'lucide-react';
import { UserIdDisplay } from '@/components/ui/UserIdDisplay';
import { AdminUserDetailsSkeleton } from '@/components/ui/Skeletons';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  avatarUrl: string | null;
  stats: {
    totalReviews: number;
    approved: number;
    rejected: number;
    pending: number;
    likesReceived: number;
    dislikesReceived: number;
    reportsSent: number;
    reportsReceived: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    text: string;
    status: string;
    createdAt: string;
    company: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await getUserDetails(userId);
      setUser(data);
    } catch (err: any) {
      toast.error('Не вдалося завантажити користувача');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">
            <CheckCircle size={12} />
            Одобрено
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
            <XCircle size={12} />
            Відхилено
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
            <Clock size={12} />
            На модерації
          </span>
        );
      default:
        return null;
    }
  };

  if (loading || !user) {
    return <AdminUserDetailsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад до списку користувачів</span>
          </Link>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="size-14 sm:size-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shrink-0">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate break-words min-w-0">{user.name}</h1>
                  {user.isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold rounded-lg shrink-0">
                      <Shield size={14} className="sm:w-4 sm:h-4" />
                      Адміністратор
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-slate-600">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail size={14} className="sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate break-all min-w-0">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="sm:w-4 sm:h-4 shrink-0" />
                    <span className="whitespace-nowrap">Реєстрація: {formatDate(user.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <UserIdDisplay userId={user.id} showLink={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Статистика</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Всього відгуків</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{user.stats.totalReviews}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">Одобрено</span>
              </div>
              <div className="text-2xl font-bold text-emerald-900">{user.stats.approved}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={18} className="text-red-500" />
                <span className="text-sm font-medium text-red-700">Відхилено</span>
              </div>
              <div className="text-2xl font-bold text-red-900">{user.stats.rejected}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">На модерації</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">{user.stats.pending}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp size={18} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Лайків отримано</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{user.stats.likesReceived}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown size={18} className="text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Дізлайків отримано</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">{user.stats.dislikesReceived}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-purple-500" />
                <span className="text-sm font-medium text-purple-700">Жалоб відправлено</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{user.stats.reportsSent}</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-pink-500" />
                <span className="text-sm font-medium text-pink-700">Жалоб отримано</span>
              </div>
              <div className="text-2xl font-bold text-pink-900">{user.stats.reportsReceived}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Останні відгуки</h2>
          {user.recentReviews.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare size={48} className="mx-auto mb-2 text-slate-300" />
              <p>Поки що немає відгуків</p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.recentReviews.map((review) => (
                <div key={review.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/company/${review.company.slug}`}
                        className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors truncate break-words min-w-0"
                      >
                        {review.company.name}
                      </Link>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>
                  {review.text && (
                    <p className="text-slate-700 text-sm mb-2 line-clamp-2 break-words">{review.text}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{formatDate(review.createdAt)}</span>
                    <Link
                      href={`/review/${review.id}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Відкрити відгук
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
