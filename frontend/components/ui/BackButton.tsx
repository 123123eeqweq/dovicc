'use client';

import { ArrowLeft } from 'lucide-react';

export const BackButton = () => {
  return (
    <button
      onClick={() => window.history.back()}
      className="flex items-center justify-center gap-2 h-12 px-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-medium transition-colors w-full sm:w-auto shadow-sm"
    >
      <ArrowLeft size={20} />
      Повернутись назад
    </button>
  );
};
