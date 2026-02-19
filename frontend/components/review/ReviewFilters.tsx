'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { CustomSelect } from '@/components/ui/CustomSelect';

export function ReviewFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollPositionRef = useRef<number>(0);
  
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [rating, setRating] = useState(searchParams.get('rating') || '');

  useEffect(() => {
    setSort(searchParams.get('sort') || 'newest');
    setRating(searchParams.get('rating') || '');
    if (scrollPositionRef.current > 0) {
      const savedScroll = scrollPositionRef.current;
      scrollPositionRef.current = 0;
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScroll);
      });
      setTimeout(() => {
        window.scrollTo(0, savedScroll);
      }, 0);
      setTimeout(() => {
        window.scrollTo(0, savedScroll);
      }, 10);
    }
  }, [searchParams]);

  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (params.get('sort') === 'newest') {
      params.delete('sort');
    }

    const query = params.toString();
    const newUrl = query ? `${pathname}?${query}` : pathname;
    scrollPositionRef.current = window.scrollY;
    router.replace(newUrl);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    updateURL({ sort: value === 'newest' ? null : value });
  };

  const handleRatingChange = (value: string) => {
    setRating(value);
    updateURL({ rating: value || null });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-4 mb-6">
      <div className="flex flex-row gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-slate-700 mb-1.5 md:mb-2">
            Сортувати
          </label>
          <CustomSelect
            value={sort}
            onChange={handleSortChange}
            options={[
              { value: 'newest', label: 'Найновіші' },
              { value: 'rating_desc', label: 'За рейтингом (високий → низький)' },
              { value: 'rating_asc', label: 'За рейтингом (низький → високий)' },
              { value: 'useful', label: 'Найкорисніші' },
            ]}
            className="h-10"
          />
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-slate-700 mb-1.5 md:mb-2">
            Мінімальний рейтинг
          </label>
          <CustomSelect
            value={rating}
            onChange={handleRatingChange}
            options={[
              { value: '', label: 'Всі рейтинги' },
              { value: '5', label: '5 зірок' },
              { value: '4', label: '4+ зірок' },
              { value: '3', label: '3+ зірок' },
              { value: '2', label: '2+ зірок' },
              { value: '1', label: '1+ зірок' },
            ]}
            className="h-10"
          />
        </div>
      </div>
    </div>
  );
}
