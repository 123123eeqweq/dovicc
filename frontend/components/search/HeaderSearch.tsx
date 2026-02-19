'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

export function HeaderSearch({ isMobile = false }: { isMobile?: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteResult>({ companies: [], categories: [] });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const { user, setIntent } = useAuth();

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
        const limit = isMobile ? 5 : 10;
        const data = await searchAutocomplete(trimmedQuery, limit);
        setResults(data);
        setShowAutocomplete(true);
      } catch (error) {
        setResults({ companies: [], categories: [] });
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

  const resultsLimit = isMobile ? 5 : 10;
  const allResults = [
    ...results.companies.map((c) => ({ ...c, type: 'company' as const })),
    ...results.categories.map((c) => ({ ...c, type: 'category' as const })),
  ].slice(0, resultsLimit);

  if (isMobile) {
    return (
      <div ref={containerRef as React.RefObject<HTMLDivElement>} className="md:hidden px-4 pb-4 relative">
        <form onSubmit={handleSubmit}>
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim().length >= 2) {
                  setShowAutocomplete(true);
                }
              }}
              className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              placeholder="Пошук..."
            />
          </div>
        </form>

        {showAutocomplete && query.trim().length >= 2 && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] border border-slate-200/80 overflow-hidden z-[100]">
            {loading ? (
              <div className="px-4 py-6 flex flex-col items-start text-slate-500">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-emerald-600" />
                <p className="mt-2 text-sm">Пошук...</p>
              </div>
            ) : allResults.length > 0 ? (
              <div className="py-2">
                {allResults.map((item) => (
                  <Link
                    key={item.id}
                    href={item.type === 'company' ? `/company/${item.slug}` : `/categories/${item.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 hover:bg-slate-50/80 transition-colors group"
                  >
                    {item.type === 'company' ? (
                      <>
                        <div className="size-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/80">
                          <CompanyLogo logoUrl={item.logoUrl} name={item.name} size="xs" variant="simple" className="rounded-xl size-10" />
                        </div>
                        <div className="flex-1 min-w-0 text-left overflow-hidden">
                          <div className="font-semibold text-slate-900 truncate text-sm group-hover:text-emerald-600 transition-colors">
                            <HighlightMatch text={item.name} query={query.trim()} />
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            <HighlightMatch text={item.category.name} query={query.trim()} />
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                      </>
                    ) : (
                      <>
                        <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Folder size={18} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0 text-left overflow-hidden">
                          <div className="font-semibold text-slate-900 truncate text-sm group-hover:text-emerald-600 transition-colors">
                            <HighlightMatch text={item.name} query={query.trim()} />
                          </div>
                          <div className="text-xs text-slate-500">Категорія</div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                      </>
                    )}
                  </Link>
                ))}
                <div className="mx-3 mt-1 mb-2 pt-3 border-t border-slate-100">
                  <p className="text-slate-500 text-xs text-left mb-2">Не знайшли те, що шукали?</p>
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
                    className="w-full py-2 px-4 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={16} />
                    <span>Додати</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-5 text-left">
                <p className="text-slate-500 text-sm">Нічого не знайдено за запитом &quot;{query.trim()}&quot;</p>
                <p className="text-slate-400 text-xs mt-1 mb-3">Спробуйте інший запит</p>
                <div className="pt-3 border-t border-slate-100">
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
                    className="w-full py-2 px-4 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={16} />
                    <span>Додати компанію</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden md:flex flex-1 max-w-sm relative"
      ref={containerRef as React.RefObject<HTMLFormElement>}
    >
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setShowAutocomplete(true);
            }
          }}
          className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm outline-none"
          placeholder="Пошук компаній або категорій..."
        />
      </div>

      {showAutocomplete && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] border border-slate-200/80 overflow-hidden z-[100]">
          {loading ? (
            <div className="px-4 py-6 flex flex-col items-start text-slate-500">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-emerald-600" />
              <p className="mt-2 text-sm">Пошук...</p>
            </div>
          ) : allResults.length > 0 ? (
            <div className="py-2">
              {allResults.map((item) => (
                <Link
                  key={item.id}
                  href={item.type === 'company' ? `/company/${item.slug}` : `/categories/${item.slug}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 hover:bg-slate-50/80 transition-colors group"
                >
                  {item.type === 'company' ? (
                    <>
                      <div className="size-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/80">
                        <CompanyLogo logoUrl={item.logoUrl} name={item.name} size="xs" variant="simple" className="rounded-xl size-10" />
                      </div>
                      <div className="flex-1 min-w-0 text-left overflow-hidden">
                        <div className="font-semibold text-slate-900 truncate text-sm group-hover:text-emerald-600 transition-colors">
                          <HighlightMatch text={item.name} query={query.trim()} />
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          <HighlightMatch text={item.category.name} query={query.trim()} />
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                    </>
                  ) : (
                    <>
                      <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Folder size={18} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0 text-left overflow-hidden">
                        <div className="font-semibold text-slate-900 truncate text-sm group-hover:text-emerald-600 transition-colors">
                          <HighlightMatch text={item.name} query={query.trim()} />
                        </div>
                        <div className="text-xs text-slate-500">Категорія</div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                    </>
                  )}
                </Link>
              ))}
              <div className="mx-3 mt-1 mb-2 pt-3 border-t border-slate-100">
                <p className="text-slate-500 text-xs text-left mb-2">Не знайшли те, що шукали?</p>
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
                  className="w-full py-2 px-4 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle size={16} />
                  <span>Додати</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 text-left">
              <p className="text-slate-500 text-sm">Нічого не знайдено за запитом &quot;{query.trim()}&quot;</p>
              <p className="text-slate-400 text-xs mt-1 mb-3">Спробуйте інший запит</p>
              <div className="pt-3 border-t border-slate-100">
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
                  className="w-full py-2 px-4 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle size={16} />
                  <span>Додати компанію</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSuccess={() => {
          setShowAddCompanyModal(false);
          setQuery('');
          router.push('/');
        }}
      />
    </form>
  );
}
