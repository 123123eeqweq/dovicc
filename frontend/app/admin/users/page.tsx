'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTopUsers } from '@/lib/api';
import { toast } from '@/lib/toast';
import { ArrowLeft, User, Mail, Calendar, MessageSquare, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { UserIdDisplay } from '@/components/ui/UserIdDisplay';
import { AdminUserTableSkeleton } from '@/components/ui/Skeletons';

interface TopUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  reviewsCount: number;
  approvedReviewsCount: number;
  reportsCount: number;
  lastActivityAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getTopUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error('Не вдалося завантажити користувачів');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сьогодні';
    if (diffDays === 1) return 'вчора';
    if (diffDays < 7) return `${diffDays} дн. тому`;
    
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Користувачі</h1>
            <p className="text-slate-600">
              Топ активних користувачів за кількістю відгуків
            </p>
          </div>
        </div>
        {loading ? (
          <AdminUserTableSkeleton />
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Користувачі не знайдено</h2>
            <p className="text-slate-600">Поки що немає жодного користувача</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Користувач
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">
                        ID
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Відгуків
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                        Жалоб
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                        Реєстрація
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                        Активність
                      </th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="size-8 sm:size-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-medium text-slate-900 text-sm truncate break-words min-w-0">{user.name}</span>
                                {user.isAdmin && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded shrink-0">
                                    <Shield size={10} />
                                    <span className="hidden sm:inline">Адмін</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5 text-xs text-slate-500 min-w-0">
                                <Mail size={10} className="shrink-0" />
                                <span className="truncate break-all">{user.email}</span>
                              </div>
                            </div>
                            <div className="mt-1 sm:hidden">
                              <UserIdDisplay userId={user.id} variant="compact" />
                            </div>
                            <div className="mt-1 sm:hidden flex items-center gap-3 text-xs text-slate-600">
                              <div className="flex items-center gap-0.5">
                                <AlertCircle size={12} className="text-orange-500 shrink-0" />
                                <span>{user.reportsCount} жалоб</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <Calendar size={12} className="text-slate-400 shrink-0" />
                                <span>{formatDateShort(user.lastActivityAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 hidden sm:table-cell">
                        <UserIdDisplay userId={user.id} variant="compact" />
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <MessageSquare size={13} className="text-slate-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-900">{user.reviewsCount}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-0.5">
                          <AlertCircle size={13} className="text-orange-500 shrink-0" />
                          <span className="text-sm text-slate-700">{user.reportsCount}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-0.5 text-sm text-slate-600 whitespace-nowrap">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-0.5 text-sm text-slate-600 whitespace-nowrap">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{formatDateShort(user.lastActivityAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
