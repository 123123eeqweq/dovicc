import Link from 'next/link';
import { Home, CloudOff } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { NotFoundSearch } from '@/components/search/NotFoundSearch';

export default function SuperAdminNotFound() {
  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-16 flex flex-col items-center justify-center text-center">
      <div className="relative mb-6 select-none">
        <h1 className="text-[120px] md:text-[200px] font-black text-emerald-600/5 leading-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <CloudOff className="text-emerald-600 w-12 h-12 md:w-16 md:h-16" />
          </div>
        </div>
      </div>
      
      <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Сторінку не знайдено
      </h2>
      <p className="text-slate-600 text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
        Вибачте, але сторінка, яку ви шукаєте, не існує, була переміщена або посилання невірне.
      </p>

      <div className="w-full max-w-lg space-y-8">
        <NotFoundSearch />

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all shadow-md w-full sm:w-auto">
            <Home size={20} />
            На головну
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
