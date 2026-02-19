'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Folder, PlusCircle, ChevronRight } from 'lucide-react';
import { searchAutocomplete } from '@/lib/api';
import { HighlightMatch } from './HighlightMatch';
import { useAuth } from '@/context/AuthContext';
import { AddCompanyModal } from '@/components/company/AddCompanyModal';
import { CompanyLogo } from '@/components/company/CompanyLogo';

interface AutocompleteResult {
  companies: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    category: {
      name: string;
    };
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export function HeroSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteResult>({ companies: [], categories: [] });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, setIntent } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMobile && showAutocomplete) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isMobile, showAutocomplete]);

  useEffect(() => {
    const fetchAutocomplete = async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        setResults({ companies: [], categories: [] });
        setShowAutocomplete(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchAutocomplete(trimmedQuery, 5);
        setResults(data);
        updateDropdownPosition();
        setShowAutocomplete(true);
      } catch (error) {
        setResults({ companies: [], categories: [] });
        updateDropdownPosition();
        setShowAutocomplete(true);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAutocomplete, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      setShowAutocomplete(false);
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleResultClick = () => {
    setShowAutocomplete(false);
    setQuery('');
  };

  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (showAutocomplete) {
      updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [showAutocomplete, query]);

  const allResults = [
    ...results.companies.map((c) => ({ ...c, type: 'company' as const })),
    ...results.categories.map((c) => ({ ...c, type: 'category' as const })),
  ].slice(0, 5);

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto relative mb-8" style={{ zIndex: 1001, position: 'relative' }}>
      <div className="relative" style={{ zIndex: 1002 }}>
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-white rounded-xl md:rounded-2xl border-2 border-emerald-300/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(5,150,105,0.15)] p-2 md:p-2.5 focus-within:border-emerald-500 focus-within:shadow-[0_12px 40px_-8px_rgba(0,0,0,0.15),0_6px 24px_-4px_rgba(5,150,105,0.25)] focus-within:scale-[1.01] transition-all duration-300"
        >
          <span className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 text-emerald-500 shrink-0">
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setShowAutocomplete(true);
              }
            }}
            className="w-full h-9 md:h-12 bg-transparent border-none focus:ring-0 text-sm md:text-lg text-slate-900 placeholder:text-slate-400 outline-none"
            placeholder="Що ви шукаєте?"
          />
          <button
            type="submit"
            className="h-9 md:h-12 px-5 md:px-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg md:rounded-xl text-sm md:text-base font-bold transition-all shadow-[0_4px 16px_-4px_rgba(5,150,105,0.5)] hover:shadow-[0_6px 24px_-4px_rgba(5,150,105,0.5)] hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            Пошук
          </button>
        </form>

        {showAutocomplete && query.trim().length >= 2 && (
          <div 
            className="fixed bg-white rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] border border-slate-200/80 overflow-hidden" 
            style={{ 
              zIndex: 99999,
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {loading ? (
              <div className="px-5 py-8 flex flex-col items-start text-slate-500">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-emerald-600" />
                <p className="mt-3 text-sm">Пошук...</p>
              </div>
            ) : allResults.length > 0 ? (
              <div className="py-2 px-2">
                {allResults.map((item) => (
                  <Link
                    key={item.id}
                    href={item.type === 'company' ? `/company/${item.slug}` : `/categories/${item.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50/80 transition-colors group"
                  >
                    {item.type === 'company' ? (
                      <>
                        <div className="size-11 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/80">
                          <CompanyLogo logoUrl={item.logoUrl} name={item.name} size="xs" variant="simple" className="rounded-xl" />
                        </div>
                        <div className="flex-1 min-w-0 text-left overflow-hidden">
                          <div className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors text-sm">
                            <HighlightMatch text={item.name} query={query.trim()} />
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            <HighlightMatch text={item.category.name} query={query.trim()} />
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                      </>
                    ) : (
                      <>
                        <div className="size-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Folder size={20} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0 text-left overflow-hidden">
                          <div className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors text-sm">
                            <HighlightMatch text={item.name} query={query.trim()} />
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">Категорія</div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                      </>
                    )}
                  </Link>
                ))}
                <div className="mx-3 mt-1 mb-2 pt-4 border-t border-slate-100">
                  <p className="text-slate-500 text-sm text-left mb-3">Не знайшли те, що шукали?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      if (user) {
                        setShowAddCompanyModal(true);
                      } else {
                        setIntent({ type: 'ADD_COMPANY' });
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={18} />
                    <span>Додати компанію</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-6 text-left">
                <p className="text-slate-500 text-sm">Нічого не знайдено за запитом &quot;{query.trim()}&quot;</p>
                <p className="text-slate-400 text-xs mt-1 mb-4">Спробуйте інший запит або перейдіть до повного пошуку</p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-slate-500 text-sm text-left mb-3">Не знайшли те, що шукали?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutocomplete(false);
                      if (user) {
                        setShowAddCompanyModal(true);
                      } else {
                        setIntent({ type: 'ADD_COMPANY' });
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={18} />
                    <span>Додати компанію</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSuccess={() => {
          setShowAddCompanyModal(false);
          setQuery('');
          router.push('/');
        }}
      />
    </div>
  );
}
