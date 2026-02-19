'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, MapPin, Star, LayoutGrid, List, ChevronRight, X } from 'lucide-react';
import { CompanyCard } from '@/components/company/CompanyCard';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { createPortal } from 'react-dom';

interface Company {
  id: string;
  name: string;
  slug: string;
  rating: number;
  reviewCount: number;
}

interface CategoryFiltersProps {
  companies: Company[];
}

type SortOption = 'rating_desc' | 'reviews_desc' | 'name_asc';
type ViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE = 18;

export function CategoryFilters({ companies }: CategoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollPositionRef = useRef<number>(0);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [reviewsFilter, setReviewsFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('rating_desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  useEffect(() => {
    const ratingParam = searchParams.get('rating');
    if (ratingParam) {
      const rating = parseInt(ratingParam, 10);
      if ([3, 4, 5].includes(rating)) {
        setRatingFilter(rating);
      }
    } else {
      setRatingFilter(null);
    }

    const reviewsParam = searchParams.get('reviews');
    if (reviewsParam) {
      const reviews = parseInt(reviewsParam, 10);
      if ([10, 50, 100].includes(reviews)) {
        setReviewsFilter(reviews);
      }
    } else {
      setReviewsFilter(null);
    }

    const sortParam = searchParams.get('sort') as SortOption | null;
    if (sortParam && ['rating_desc', 'reviews_desc', 'name_asc'].includes(sortParam)) {
      setSortOption(sortParam);
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const timeout1 = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    const timeout2 = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [currentPage]);

  useEffect(() => {
    if (isFiltersModalOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isFiltersModalOpen]);

  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (updates.rating !== undefined || updates.reviews !== undefined || updates.sort !== undefined) {
      params.delete('page');
    }

    const query = params.toString();
    const newUrl = query ? `${pathname}?${query}` : pathname;

    scrollPositionRef.current = window.scrollY;
    router.replace(newUrl);
  };

  const filterCounts = useMemo(() => {
    return {
      rating5: companies.filter(c => c.rating >= 5).length,
      rating4: companies.filter(c => c.rating >= 4).length,
      rating3: companies.filter(c => c.rating >= 3).length,
      reviews100: companies.filter(c => c.reviewCount >= 100).length,
      reviews50: companies.filter(c => c.reviewCount >= 50).length,
      reviews10: companies.filter(c => c.reviewCount >= 10).length,
    };
  }, [companies]);

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;
    if (ratingFilter !== null) {
      filtered = filtered.filter(company => {
        if (ratingFilter === 5) {
          return company.rating >= 5;
        } else if (ratingFilter === 4) {
          return company.rating >= 4;
        } else if (ratingFilter === 3) {
          return company.rating >= 3;
        }
        return true;
      });
    }

    if (reviewsFilter !== null) {
      filtered = filtered.filter(company => {
        return company.reviewCount >= reviewsFilter;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'rating_desc':
          return b.rating - a.rating;
        case 'reviews_desc':
          return b.reviewCount - a.reviewCount;
        case 'name_asc':
          return a.name.localeCompare(b.name, 'uk');
        default:
          return 0;
      }
    });

    return sorted;
  }, [companies, ratingFilter, reviewsFilter, sortOption]);

  const totalPages = Math.ceil(filteredAndSortedCompanies.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedCompanies = filteredAndSortedCompanies.slice(
    (validPage - 1) * ITEMS_PER_PAGE,
    validPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const query = params.toString();
    const newUrl = query ? `${pathname}?${query}` : pathname;

    scrollPositionRef.current = 0;
    router.replace(newUrl);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const FiltersContent = () => (
    <div>
      <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
        <SlidersHorizontal className="text-emerald-600 w-5 h-5" />
        Фільтри
      </h3>
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Місто</label>
              <div className="relative mb-3">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <MapPin size={18} />
                </span>
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                  placeholder="Введіть місто"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600/20" />
                  <span className="text-sm text-slate-600 group-hover:text-emerald-600 transition-colors">Вся Україна</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed group opacity-60">
                  <input type="checkbox" disabled className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600/20 cursor-not-allowed" />
                  <span className="text-sm text-slate-600">Київ</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">840</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed group opacity-60">
                  <input type="checkbox" disabled className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600/20 cursor-not-allowed" />
                  <span className="text-sm text-slate-600">Львів</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">215</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed group opacity-60">
                  <input type="checkbox" disabled className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600/20 cursor-not-allowed" />
                  <span className="text-sm text-slate-600">Одеса</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">124</span>
                </label>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Рейтинг</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    value="5"
                    checked={ratingFilter === 5}
                    onChange={() => {
                      setRatingFilter(5);
                      updateURL({ rating: '5' });
                    }}
                    className="text-emerald-600 focus:ring-emerald-600/20 border-slate-300"
                  />
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-current" />)}
                  </div>
                  <span className="text-sm text-slate-500">5 зірок</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">{filterCounts.rating5}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    value="4"
                    checked={ratingFilter === 4}
                    onChange={() => {
                      setRatingFilter(4);
                      updateURL({ rating: '4' });
                      setIsFiltersModalOpen(false);
                    }}
                    className="text-emerald-600 focus:ring-emerald-600/20 border-slate-300"
                  />
                  <div className="flex text-yellow-400">
                    {[1,2,3,4].map(i => <Star key={i} size={18} className="fill-current" />)}
                    <Star size={18} className="text-slate-200" />
                  </div>
                  <span className="text-sm text-slate-500">4+ зірок</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">{filterCounts.rating4}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    value="3"
                    checked={ratingFilter === 3}
                    onChange={() => {
                      setRatingFilter(3);
                      updateURL({ rating: '3' });
                      setIsFiltersModalOpen(false);
                    }}
                    className="text-emerald-600 focus:ring-emerald-600/20 border-slate-300"
                  />
                  <div className="flex text-yellow-400">
                    {[1,2,3].map(i => <Star key={i} size={18} className="fill-current" />)}
                    {[4,5].map(i => <Star key={i} size={18} className="text-slate-200" />)}
                  </div>
                  <span className="text-sm text-slate-500">3+ зірок</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">{filterCounts.rating3}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    value=""
                    checked={ratingFilter === null}
                    onChange={() => {
                      setRatingFilter(null);
                      updateURL({ rating: null });
                      setIsFiltersModalOpen(false);
                    }}
                    className="text-emerald-600 focus:ring-emerald-600/20 border-slate-300"
                  />
                  <span className="text-sm text-slate-500">Всі рейтинги</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">{companies.length}</span>
                </label>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Кількість відгуків</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="reviews"
                    value="100"
                    checked={reviewsFilter === 100}
                    onChange={() => {
                      setReviewsFilter(100);
                      updateURL({ reviews: '100' });
                      setIsFiltersModalOpen(false);
                    }}
                    className="text-emerald-600 focus:ring-emerald-600/20 border-slate-300"
                  />
                  <span className="text-sm text-slate-500">100+ відгуків</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">{filterCounts.reviews100}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="reviews"
                    value="50"
                    checked={reviewsFilter === 50}
                    onChange={() => {
                      setReviewsFilter(50);
                      updateURL({ reviews: '50' });
                      setIsFiltersModalOpen(false);
                    }}
                    className="text-emerald-600 focus:ring-emerald-600/20 border-slate-300"
                  />
                  <span className="text-sm text-slate-500">50+ відгуків</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">{filterCounts.reviews50}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="reviews"
                    value="10"
                    checked={reviewsFilter === 10}
                    onChange={() => {
                      setReviewsFilter(10);
                      updateURL({ reviews: '10' });
                      setIsFiltersModalOpen(false);
                    }}
                    className="text-emerald-600 focus:ring-emerald-600/20 border-slate-300"
                  />
                  <span className="text-sm text-slate-500">10+ відгуків</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">{filterCounts.reviews10}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="reviews"
                    value=""
                    checked={reviewsFilter === null}
                    onChange={() => {
                      setReviewsFilter(null);
                      updateURL({ reviews: null });
                      setIsFiltersModalOpen(false);
                    }}
                    className="text-emerald-600 focus:ring-emerald-600/20 border-slate-300"
                  />
                  <span className="text-sm text-slate-500">Всі компанії</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-50 px-1.5 py-0.5 rounded">{companies.length}</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => {
                setRatingFilter(null);
                setReviewsFilter(null);
                updateURL({ rating: null, reviews: null });
              }}
              disabled={ratingFilter === null && reviewsFilter === null}
              className="w-full mt-6 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200"
            >
              <X size={16} />
              Скинути всі фільтри
            </button>
          </div>
        </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <div className="lg:hidden sticky top-16 z-[1001] -mx-4 px-4 -mt-2 pt-2 pb-3 bg-white border-b border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)]">
        <div className="space-y-3">
          <button
            onClick={() => setIsFiltersModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 bg-white border border-slate-200/80 rounded-xl text-slate-700 font-medium text-sm md:text-base shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)] hover:border-emerald-300 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-all active:scale-[0.99]"
          >
            <SlidersHorizontal size={20} className="text-emerald-600" />
            Фільтри
            {(ratingFilter !== null || reviewsFilter !== null) && (
              <span className="ml-auto bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {[ratingFilter, reviewsFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <span className="text-xs md:text-sm font-medium text-slate-600 shrink-0">Сортування:</span>
              <CustomSelect
                value={sortOption}
                onChange={(value) => {
                  const newSort = value as SortOption;
                  setSortOption(newSort);
                  updateURL({ sort: newSort });
                }}
                options={[
                  { value: 'rating_desc', label: 'Найвищий рейтинг' },
                  { value: 'reviews_desc', label: 'Найбільше відгуків' },
                  { value: 'name_asc', label: 'За назвою (А-Я)' },
                ]}
                className="h-9 min-w-0 flex-1 sm:flex-initial sm:min-w-[180px]"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs md:text-sm text-slate-500 sm:hidden">
                <span className="font-semibold text-slate-900">{filteredAndSortedCompanies.length}</span> {filteredAndSortedCompanies.length === 1 ? 'компанія' : filteredAndSortedCompanies.length < 5 ? 'компанії' : 'компаній'}
              </span>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-emerald-600'
                      : 'hover:bg-white/50 text-slate-500'
                  }`}
                >
                  <LayoutGrid size={18} className="md:w-5 md:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-emerald-600'
                      : 'hover:bg-white/50 text-slate-500'
                  }`}
                >
                  <List size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
          <FiltersContent />
        </div>
      </aside>

      {isFiltersModalOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[1003] lg:hidden"
            onClick={() => setIsFiltersModalOpen(false)}
          />
          <div
            className="fixed inset-y-0 left-0 right-0 bg-white z-[1004] lg:hidden overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="text-emerald-600 w-5 h-5" />
                Фільтри
              </h3>
              <button
                onClick={() => setIsFiltersModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-6">
              <FiltersContent />
            </div>
          </div>
        </>,
        document.body
      )}

      <div className="flex-1">
        <div className="hidden lg:flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <span className="text-xs md:text-sm font-medium text-slate-600 shrink-0">Сортування:</span>
            <CustomSelect
              value={sortOption}
              onChange={(value) => {
                const newSort = value as SortOption;
                setSortOption(newSort);
                updateURL({ sort: newSort });
              }}
              options={[
                { value: 'rating_desc', label: 'Найвищий рейтинг' },
                { value: 'reviews_desc', label: 'Найбільше відгуків' },
                { value: 'name_asc', label: 'За назвою (А-Я)' },
              ]}
              className="h-9 min-w-0 flex-1 sm:flex-initial sm:min-w-[180px]"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs md:text-sm text-slate-500 sm:hidden">
              <span className="font-semibold text-slate-900">{filteredAndSortedCompanies.length}</span> {filteredAndSortedCompanies.length === 1 ? 'компанія' : filteredAndSortedCompanies.length < 5 ? 'компанії' : 'компаній'}
            </span>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-emerald-600'
                    : 'hover:bg-white/50 text-slate-500'
                }`}
              >
                <LayoutGrid size={18} className="md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-emerald-600'
                    : 'hover:bg-white/50 text-slate-500'
                }`}
              >
                <List size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 md:mb-6 text-xs md:text-sm hidden sm:block">
          <span className="text-slate-500">Знайдено:</span>{' '}
          <span className="font-semibold text-slate-900">{filteredAndSortedCompanies.length}</span>{' '}
          <span className="text-slate-500">{filteredAndSortedCompanies.length === 1 ? 'компанія' : filteredAndSortedCompanies.length < 5 ? 'компанії' : 'компаній'}</span>
        </div>

        {filteredAndSortedCompanies.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-slate-200/80 bg-white/50">
            <p className="text-slate-500 text-lg font-medium">Компанії не знайдено</p>
            <p className="text-slate-400 text-sm mt-2">Спробуйте змінити фільтри</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {paginatedCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 md:mt-14 flex justify-center">
            <nav className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={() => handlePageChange(validPage - 1)}
                disabled={validPage === 1}
                className="flex items-center justify-center size-9 md:size-10 rounded-xl border border-slate-200/80 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} className="rotate-180 md:w-5 md:h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= validPage - 1 && page <= validPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`flex items-center justify-center size-9 md:size-10 rounded-xl border transition-all font-medium text-sm md:text-base ${
                        page === validPage
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)] hover:bg-emerald-700'
                          : 'border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 hover:border-slate-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === validPage - 2 || page === validPage + 2) {
                  return (
                    <span key={page} className="flex items-center justify-center size-9 md:size-10 text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(validPage + 1)}
                disabled={validPage === totalPages}
                className="flex items-center justify-center size-9 md:size-10 rounded-xl border border-slate-200/80 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} className="md:w-5 md:h-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
