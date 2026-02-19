'use client';

import Link from 'next/link';
import { Star, MapPin, Folder } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    slug: string;
    rating: number;
    reviewCount: number;
    logoUrl?: string | null;
    city?: string;
    category?: {
      name: string;
      slug: string;
    };
  };
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full min-w-0">
      <div className="p-5 sm:p-6 flex-1 flex flex-col min-w-0">
        <Link href={`/company/${company.slug}`} className="flex flex-col min-w-0">
          <CompanyLogo 
            logoUrl={company.logoUrl} 
            name={company.name} 
            size="md"
            variant="simple"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0 border border-slate-200/80 group-hover:border-slate-300 transition-colors self-start"
          />
          <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug line-clamp-2 break-words overflow-hidden group-hover:text-emerald-600 transition-colors mt-3 min-w-0">
            {company.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md text-sm border border-amber-200/60">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              {company.rating.toFixed(1)}
            </span>
            <span className="text-slate-400 text-xs">
              {company.reviewCount === 1 ? '1 відгук' : company.reviewCount >= 2 && company.reviewCount <= 4 ? `${company.reviewCount} відгуки` : `${company.reviewCount} відгуків`}
            </span>
          </div>
        </Link>
        {company.category && (
          <Link 
            href={`/categories/${company.category.slug}`}
            className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium hover:text-emerald-600 transition-colors mt-3 self-start min-w-0 max-w-full"
          >
            <Folder size={12} className="shrink-0" />
            <span className="truncate">{company.category.name}</span>
          </Link>
        )}
      </div>

      <Link href={`/company/${company.slug}`} className="block min-w-0">
        <div className="px-5 sm:px-6 pb-4 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm min-w-0">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate min-w-0">{company.city || 'Україна'}</span>
          </div>
        </div>
      </Link>

      <div className="px-5 sm:px-6 pb-5 pt-4 border-t border-slate-200/80 flex gap-2 mt-auto min-w-0 shrink-0">
        <Link 
          href={`/company/${company.slug}`} 
          className="flex-1 min-w-0 h-10 flex items-center justify-center rounded-xl border border-slate-200/80 text-slate-600 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          <span className="truncate">Деталі</span>
        </Link>
        <Link 
          href={`/review/add?company=${company.slug}`} 
          className="flex-1 min-w-0 h-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)]"
        >
          <span className="truncate">Відгук</span>
        </Link>
      </div>
    </div>
  );
};
