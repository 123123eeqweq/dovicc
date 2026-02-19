'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { resetPassword } from '@/lib/api';
import { toast } from '@/lib/toast';
import { getErrorMessage, getErrorType } from '@/lib/errorMessages';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const link = searchParams.get('link');
  const [mounted, setMounted] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!link) {
      setError('Посилання для скидання пароля не знайдено');
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!link) {
      setError('Посилання для скидання пароля не знайдено');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль повинен містити мінімум 6 символів');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(link, newPassword);
      setSuccess(true);
      toast.success('Пароль успішно змінено!');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      const errorType = getErrorType(
        (err as { status?: number }).status,
        (err as { errorCode?: string }).errorCode
      );
      setError(errorMessage);
      toast[errorType](errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Завантаження...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center mt-8">
          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <Lock className="size-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Пароль успішно змінено!
          </h1>
          <p className="text-slate-600 mb-6">
            Ваш пароль було успішно змінено. Зараз ви будете перенаправлені на головну сторінку.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
            На головну
          </Link>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="flex justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center mt-8">
          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-full bg-red-100 flex items-center justify-center">
              <Lock className="size-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Помилка
          </h1>
          <p className="text-slate-600 mb-6">
            Посилання для скидання пароля не знайдено або недійсне.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
            На головну
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 mt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 mb-4 bg-emerald-100 rounded-full">
            <Lock className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Встановити новий пароль
          </h1>
          <p className="text-slate-600 text-sm">
            Введіть новий пароль для вашого акаунта
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Новий пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                placeholder="Мінімум 6 символів"
                required
                minLength={6}
                maxLength={100}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Підтвердити пароль
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Введіть пароль ще раз"
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm">
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Зміна пароля...
              </>
            ) : (
              'Змінити пароль'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Завантаження...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
