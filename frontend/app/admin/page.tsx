'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, MessageSquare, AlertTriangle, ArrowRight, LogOut, User, Building2, FileText } from 'lucide-react';
import { getCurrentUser, getImageSrc } from '@/lib/api';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';
import { useAuth } from '@/context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const { logout: logoutFromContext } = useAuth();

  const loadUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch {
      toast.error('Не вдалося завантажити дані');
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logoutFromContext();
      router.push('/');
    } catch (err) {}
  };

  if (!user) {
    return null;
  }

  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden relative">
                {user.avatarUrl ? (
                  <Image src={getImageSrc(user.avatarUrl)} alt={`Аватар адміністратора ${user.name}`} fill sizes="64px" className="object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 truncate break-words min-w-0">
                  Вітаємо, {user.name}!
                </h1>
                <p className="text-slate-600 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Адміністратор</span>
                </p>
                <p className="text-sm text-slate-500 mt-1 truncate break-all min-w-0">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              <LogOut size={18} />
              <span>Вийти</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/reviews"
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <MessageSquare className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 truncate break-words min-w-0">Модерація відгуків</h2>
                  <p className="text-sm text-slate-500 break-words">Перевірка та схвалення відгуків</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link
            href="/admin/companies"
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Building2 className="w-7 h-7 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 truncate break-words min-w-0">Управління компаніями</h2>
                  <p className="text-sm text-slate-500 break-words">Редагування та модерація компаній</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link
            href="/admin/reports"
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 truncate break-words min-w-0">Розгляд скарг</h2>
                  <p className="text-sm text-slate-500 break-words">Аналіз та вирішення скарг</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <User className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 truncate break-words min-w-0">Користувачі</h2>
                  <p className="text-sm text-slate-500 break-words">Аналіз активності користувачів</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link
            href="/admin/companies/proposals"
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <FileText className="w-7 h-7 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 truncate break-words min-w-0">Пропозиції компаній</h2>
                  <p className="text-sm text-slate-500 break-words">Модерація пропозицій від користувачів</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>
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
