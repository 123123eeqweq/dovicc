import Image from 'next/image';
import type { Metadata } from 'next';
import { getHreflangAlternates } from '@/lib/seo';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Інше',
  description: 'Інший контент DOVI — додаткові матеріали та корисна інформація.',
  alternates: {
    canonical: `${BASE_URL}/inshe`,
    languages: getHreflangAlternates(`${BASE_URL}/inshe`),
  },
};

export default function InshePage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Інше</p>
            <h1 className="text-2xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Інше
            </h1>
            <div className="aspect-video md:aspect-[21/9] max-w-4xl mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 relative">
              <Image
                src="/images/inshe-placeholder.svg"
                alt="Інше"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
