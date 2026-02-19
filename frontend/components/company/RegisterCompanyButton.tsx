'use client';

import Link from 'next/link';
import { toast } from '@/lib/toast';

export function RegisterCompanyButton() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast.info('Функція на стадії розробки');
  };

  return (
    <Link 
      href="/categories" 
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base transition-colors border border-white/20 active:scale-[0.98]"
    >
      Зареєструвати
    </Link>
  );
}
