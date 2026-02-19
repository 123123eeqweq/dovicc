'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Building2 } from 'lucide-react';
import { CategoryImage } from './CategoryImage';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  companiesCount?: number;
}

interface CategoriesListProps {
  categories: Category[];
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase().trim();
    return categories.filter(category => 
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  return (
    <>
      <div className="mb-6 md:mb-12">
        <div className="relative w-full max-w-xl">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4 text-emerald-500">
            <Search size={18} className="md:w-5 md:h-5" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 md:h-12 pl-10 md:pl-12 pr-4 bg-white border-2 border-emerald-200/70 rounded-xl md:rounded-2xl text-sm md:text-base focus:ring-0 focus:border-emerald-500 focus:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)] transition-all shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] placeholder:text-slate-400 text-slate-900 outline-none" 
            placeholder="Пошук категорій..." 
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 md:py-16 rounded-xl md:rounded-2xl bg-white/80 border border-slate-200/80">
          <p className="text-slate-500 text-base md:text-lg font-medium">Категорії не знайдено</p>
          <p className="text-slate-400 text-sm mt-2">Спробуйте інший пошуковий запит</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredCategories.map((category) => {
            const count = category.companiesCount ?? 0;

            return (
              <Link 
                href={`/categories/${category.slug}`} 
                key={category.id}
                className="group block bg-white rounded-xl md:rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:border-emerald-300 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300"
              >
                <div className="relative h-24 sm:h-36 md:h-40 overflow-hidden bg-slate-200">
                  <CategoryImage
                    slug={category.slug}
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute top-2 right-2 md:top-3 md:right-3">
                    <span className="inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] md:text-xs font-medium text-slate-700">
                      <Building2 size={10} className="md:w-3 md:h-3" />
                      {count} {count === 1 ? 'компанія' : count < 5 ? 'компанії' : 'компаній'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-slate-900/80 to-transparent">
                    <h3 className="text-sm md:text-lg font-bold text-white drop-shadow-md group-hover:text-emerald-100 transition-colors line-clamp-2 leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </div>
                <div className="p-3 md:p-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                    Переглянути
                    <ArrowRight size={14} className="md:w-4 md:h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
