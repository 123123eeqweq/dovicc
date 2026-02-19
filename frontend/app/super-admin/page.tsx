'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Crown,
  Shield,
  Users,
  Building2,
  MessageSquare,
  Star,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Clock,
  FileText,
  BarChart3,
  LogOut,
} from 'lucide-react';
import {
  getCurrentUser,
  getSuperAdmins,
  getAdmins,
  promoteToAdmin,
  demoteFromAdmin,
  getSuperAdminAnalytics,
} from '@/lib/api';
import { toast } from '@/lib/toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/context/AuthContext';

interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface Analytics {
  coreMetrics: {
    totalUsers: number;
    totalCompanies: number;
    totalReviews: number;
    avgRating: number;
    periodChange: {
      users: number;
      companies: number;
      reviews: number;
    };
  };
  activityMetrics: Array<{
    date: string;
    newUsers: number;
    newCompanies: number;
    newReviews: number;
    approved: number;
    rejected: number;
  }>;
  moderationHealth: {
    pendingReviews: number;
    pendingReviewsOld: number;
    pendingCompanies: number;
    pendingReports: number;
    status: 'ok' | 'warning' | 'critical';
  };
  adminPerformance: Array<{
    id: string;
    email: string;
    name: string;
    approveCount: number;
    rejectCount: number;
  }>;
  contentQuality: {
    topCompaniesByActivity: Array<{
      id: string;
      name: string;
      slug: string;
      reviewCount: number;
      rating: number;
    }>;
    topUsersByActivity: Array<{
      id: string;
      name: string;
      email: string;
      reviewsCount: number;
    }>;
  };
  funnel: {
    users: number;
    reviews: number;
    approved: number;
  };
}

type DateRange = 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';

export default function SuperAdminPage() {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('last7');
  const [demoteEmail, setDemoteEmail] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [promoteEmail, setPromoteEmail] = useState('');
  const [showPromoteForm, setShowPromoteForm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const router = useRouter();
  const { logout: logoutFromContext } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, customStart, customEnd]);

  const loadData = async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser({ email: userData.user.email, name: userData.user.name });
      
      const [superAdminsData, adminsData] = await Promise.all([
        getSuperAdmins(),
        getAdmins(),
      ]);
      
      setSuperAdmins(superAdminsData);
      setAdmins(adminsData);
    } catch (err: any) {
      toast.error('Не вдалося завантажити дані');
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logoutFromContext();
      router.push('/');
    } catch (err) {

    }
  };

  const loadAnalytics = async () => {
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      switch (dateRange) {
        case 'today':
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          startDate = todayStart.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          const yesterdayEnd = new Date(yesterday);
          yesterdayEnd.setHours(23, 59, 59, 999);
          startDate = yesterday.toISOString().split('T')[0];
          endDate = yesterdayEnd.toISOString().split('T')[0];
          break;
        case 'last7':
          const last7 = new Date();
          last7.setDate(last7.getDate() - 7);
          last7.setHours(0, 0, 0, 0);
          startDate = last7.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'last30':
          const last30 = new Date();
          last30.setDate(last30.getDate() - 30);
          last30.setHours(0, 0, 0, 0);
          startDate = last30.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'custom':
          if (customStart && customEnd) {
            startDate = customStart;
            endDate = customEnd;
          }
          break;
      }

      const data = await getSuperAdminAnalytics(startDate, endDate);
      setAnalytics(data);
    } catch (err: any) {
      toast.error('Не вдалося завантажити аналітику');
    }
  };

  const handlePromote = async () => {
    if (!promoteEmail.trim()) {
      toast.error('Введіть email');
      return;
    }

    try {
      await promoteToAdmin(promoteEmail.trim());
      toast.success('Користувача призначено адміном');
      setPromoteEmail('');
      setShowPromoteForm(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Не вдалося призначити адміном');
    }
  };

  const handleDemoteClick = (email: string) => {
    setDemoteEmail(email);
  };

  const handleDemote = async () => {
    if (!demoteEmail) return;

    try {
      await demoteFromAdmin(demoteEmail);
      toast.success('Права адміна знято');
      setDemoteEmail(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Не вдалося зняти права адміна');
      setDemoteEmail(null);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('uk-UA').format(num);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
  };

  useEffect(() => {
    const nav = document.querySelector('nav:first-of-type') as HTMLElement | null;
    const footer = document.querySelector('footer') as HTMLElement | null;
    if (nav) nav.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    return () => {
      if (nav) nav.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
                <div className="size-7 sm:size-8 relative shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="DOVI.COM.UA — логотип"
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
                <h2 className="text-slate-900 text-lg sm:text-xl font-bold tracking-tight">DOVI.COM.UA</h2>
              </Link>
              <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
              <span className="text-slate-600 font-medium text-sm sm:text-base hidden sm:inline">OWNERS</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {currentUser && (
                <div className="text-xs sm:text-sm text-slate-600 truncate break-all min-w-0 max-w-[150px] sm:max-w-none">
                  <span className="font-medium">{currentUser.email}</span>
                </div>
              )}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 text-sm sm:text-base shrink-0"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Вийти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="w-full lg:w-80 bg-white border-r-0 lg:border-r border-b lg:border-b-0 border-slate-200 overflow-y-auto">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Super Admin</h1>
          </div>
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">SUPER ADMINS</h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {superAdmins.map((admin) => (
                <div key={admin.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-yellow-50 rounded-lg gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="font-medium text-sm sm:text-base text-slate-900 break-words truncate min-w-0">{admin.email}</div>
                    <div className="text-xs text-slate-500 mt-1 break-words truncate min-w-0">{admin.name}</div>
                  </div>
                  <span className="px-2 py-1 text-[10px] sm:text-xs font-semibold text-yellow-700 bg-yellow-200 rounded flex-shrink-0 w-fit">
                    SUPER ADMIN
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">ADMINS</h2>
              </div>
              <button
                onClick={() => setShowPromoteForm(!showPromoteForm)}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors shrink-0"
                title="Додати адміна"
              >
                <Plus className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {showPromoteForm && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <input
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handlePromote}
                    className="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Призначити
                  </button>
                  <button
                    onClick={() => {
                      setShowPromoteForm(false);
                      setPromoteEmail('');
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 sm:space-y-3">
              {admins.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Немає адмінів</p>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-slate-50 rounded-lg gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="font-medium text-sm sm:text-base text-slate-900 break-words truncate min-w-0">{admin.email}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(admin.createdAt).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-1 text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-100 rounded">
                        ADMIN
                      </span>
                      <button
                        onClick={() => handleDemoteClick(admin.email)}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors shrink-0"
                        title="Зняти права адміна"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Період</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['today', 'yesterday', 'last7', 'last30', 'custom'] as DateRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dateRange === range
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    {range === 'today' && 'Сьогодні'}
                    {range === 'yesterday' && 'Вчора'}
                    {range === 'last7' && 'Останні 7 днів'}
                    {range === 'last30' && 'Останні 30 днів'}
                    {range === 'custom' && 'Кастомний діапазон'}
                  </button>
                ))}
              </div>
              {dateRange === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <label className="block text-sm text-slate-600 mb-1">Від</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-slate-600 mb-1">До</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {analytics && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                          {formatNumber(analytics.coreMetrics.totalUsers)}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">Всього акаунтів</div>
                      </div>
                    </div>
                    {analytics.coreMetrics.periodChange.users !== 0 && (
                      <div className={`text-xs flex items-center gap-1 ${
                        analytics.coreMetrics.periodChange.users > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {analytics.coreMetrics.periodChange.users > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {analytics.coreMetrics.periodChange.users > 0 ? '+' : ''}
                        {analytics.coreMetrics.periodChange.users} за період
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                          {formatNumber(analytics.coreMetrics.totalCompanies)}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">Всього компаній</div>
                      </div>
                    </div>
                    {analytics.coreMetrics.periodChange.companies !== 0 && (
                      <div className={`text-xs flex items-center gap-1 ${
                        analytics.coreMetrics.periodChange.companies > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {analytics.coreMetrics.periodChange.companies > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {analytics.coreMetrics.periodChange.companies > 0 ? '+' : ''}
                        {analytics.coreMetrics.periodChange.companies} за період
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                          {formatNumber(analytics.coreMetrics.totalReviews)}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">Всього відгуків</div>
                      </div>
                    </div>
                    {analytics.coreMetrics.periodChange.reviews !== 0 && (
                      <div className={`text-xs flex items-center gap-1 ${
                        analytics.coreMetrics.periodChange.reviews > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {analytics.coreMetrics.periodChange.reviews > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {analytics.coreMetrics.periodChange.reviews > 0 ? '+' : ''}
                        {analytics.coreMetrics.periodChange.reviews} за період
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                          {analytics.coreMetrics.avgRating.toFixed(1)}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">Середній рейтинг</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Активність по днях</h3>
                  <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                    <div className="inline-block min-w-full align-middle" style={{ minWidth: '600px' }}>
                      <table className="min-w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-2 sm:px-3 text-slate-600 font-medium">Дата</th>
                            <th className="text-right py-2 px-2 sm:px-3 text-slate-600 font-medium">Нові юзери</th>
                            <th className="text-right py-2 px-2 sm:px-3 text-slate-600 font-medium">Нові компанії</th>
                            <th className="text-right py-2 px-2 sm:px-3 text-slate-600 font-medium">Відгуки</th>
                            <th className="text-right py-2 px-2 sm:px-3 text-slate-600 font-medium">Approve</th>
                            <th className="text-right py-2 px-2 sm:px-3 text-slate-600 font-medium">Reject</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.activityMetrics.map((metric) => (
                            <tr key={metric.date} className="border-b border-slate-100">
                              <td className="py-2 px-2 sm:px-3 text-slate-900 whitespace-nowrap">{formatDate(metric.date)}</td>
                              <td className="py-2 px-2 sm:px-3 text-right text-slate-700">{metric.newUsers}</td>
                              <td className="py-2 px-2 sm:px-3 text-right text-slate-700">{metric.newCompanies}</td>
                              <td className="py-2 px-2 sm:px-3 text-right text-slate-700">{metric.newReviews}</td>
                              <td className="py-2 px-2 sm:px-3 text-right text-emerald-600">{metric.approved}</td>
                              <td className="py-2 px-2 sm:px-3 text-right text-red-600">{metric.rejected}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Стан модерації</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Відгуки на модерації</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {analytics.moderationHealth.pendingReviews}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Компанії на модерації</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {analytics.moderationHealth.pendingCompanies}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Скарги на модерації</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {analytics.moderationHealth.pendingReports}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {analytics.moderationHealth.status === 'ok' && (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        )}
                        {analytics.moderationHealth.status === 'warning' && (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        )}
                        {analytics.moderationHealth.status === 'critical' && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div className="text-sm text-slate-600">Статус</div>
                      </div>
                      <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        {analytics.moderationHealth.status === 'ok' && (
                          <>
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span>OK</span>
                          </>
                        )}
                        {analytics.moderationHealth.status === 'warning' && (
                          <>
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <span>Накопичується</span>
                          </>
                        )}
                        {analytics.moderationHealth.status === 'critical' && (
                          <>
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span>Критично</span>
                          </>
                        )}
                      </div>
                      {analytics.moderationHealth.pendingReviewsOld > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {analytics.moderationHealth.pendingReviewsOld} відгуків очікують &gt; 24 год
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Топ активності</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="text-sm text-slate-600 mb-3 font-medium">Топ-5 компаній по активності</div>
                      <div className="space-y-2">
                        {analytics.contentQuality.topCompaniesByActivity.length === 0 ? (
                          <p className="text-sm text-slate-500">Немає даних</p>
                        ) : (
                          analytics.contentQuality.topCompaniesByActivity.map((company, index) => (
                            <div key={company.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg gap-2">
                              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                <span className="text-sm font-semibold text-slate-400 w-6 shrink-0">{index + 1}</span>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <div className="text-sm font-medium text-slate-900 truncate break-words min-w-0">{company.name}</div>
                                  <div className="text-xs text-slate-500 break-words">
                                    Рейтинг: {company.rating.toFixed(1)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-emerald-600 shrink-0 whitespace-nowrap">{company.reviewCount} відгуків</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-3 font-medium">Топ-5 користувачів по активності</div>
                      <div className="space-y-2">
                        {analytics.contentQuality.topUsersByActivity.length === 0 ? (
                          <p className="text-sm text-slate-500">Немає даних</p>
                        ) : (
                          analytics.contentQuality.topUsersByActivity.map((user, index) => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg gap-2">
                              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                <span className="text-sm font-semibold text-slate-400 w-6 shrink-0">{index + 1}</span>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <div className="text-sm font-medium text-slate-900 truncate break-words min-w-0">{user.name}</div>
                                  <div className="text-xs text-slate-500 truncate break-all min-w-0">{user.email}</div>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-emerald-600 shrink-0 whitespace-nowrap">{user.reviewsCount} відгуків</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={demoteEmail !== null}
        onClose={() => setDemoteEmail(null)}
        onConfirm={handleDemote}
        title="Зняти права адміна?"
        message={`Ви впевнені, що хочете зняти права адміна з ${demoteEmail}?`}
        confirmText="Зняти права"
        cancelText="Скасувати"
        variant="warning"
      />
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Вийти з акаунту?"
        message="Ви впевнені, що хочете вийти?"
        confirmText="Так, вийти"
        cancelText="Скасувати"
        variant="danger"
      />
    </div>
  );
}
