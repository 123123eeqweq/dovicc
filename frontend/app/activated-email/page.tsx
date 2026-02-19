'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

function ActivatedEmailContent() {
  const searchParams = useSearchParams();
  const alreadyActivated = searchParams.get('already') === 'true';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 font-medium">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-12 md:py-20">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-8 md:p-10 text-center">
        {alreadyActivated ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="size-16 rounded-2xl bg-amber-50 flex items-center justify-center border border-slate-200/80">
                <XCircle className="size-8 text-amber-600" />
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Активація</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Email вже активовано
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Ваш email вже був активований раніше. Ви можете увійти в свій акаунт.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-slate-200/80">
                <CheckCircle className="size-8 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Активація</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Email успішно активовано!
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Ваш email було успішно активовано. Тепер ви можете писати відгуки та користуватися всіма функціями платформи.
            </p>
          </>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-center shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)]">
            На головну
          </Link>
          <Link
            href="/profile"
            className="flex-1 px-6 py-3 border border-slate-200/80 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors text-center">
            Мій профіль
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ActivatedEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 font-medium">Завантаження...</div>
      </div>
    }>
      <ActivatedEmailContent />
    </Suspense>
  );
}
