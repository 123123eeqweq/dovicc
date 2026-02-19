'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Building2, Folder } from 'lucide-react';
import { searchAutocomplete } from '@/lib/api';
import { HighlightMatch } from './HighlightMatch';

interface AutocompleteResult {
  companies: Array<{
    id: string;
    name: string;
    slug: string;
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

export function NotFoundSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteResult>({ companies: [], categories: [] });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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
    const fetchAutocomplete = async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        setResults({ companies: [], categories: [] });
        setShowAutocomplete(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchAutocomplete(trimmedQuery);
        setResults(data);
        setShowAutocomplete(data.companies.length > 0 || data.categories.length > 0);
      } catch (error) {
        setResults({ companies: [], categories: [] });
        setShowAutocomplete(false);
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

  const allResults = [
    ...results.companies.map((c) => ({ ...c, type: 'company' as const })),
    ...results.categories.map((c) => ({ ...c, type: 'category' as const })),
  ].slice(0, 5);

  return (
    <div ref={containerRef} className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 relative">
      <form onSubmit={handleSubmit} className="relative group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Search size={20} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (allResults.length > 0) {
              setShowAutocomplete(true);
            }
          }}
          className="w-full h-12 pl-12 pr-4 bg-transparent border-none text-base text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
          placeholder="Спробуйте знайти компанію або послугу..."
        />
        <button
          type="submit"
          className="absolute inset-y-1 right-1 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Пошук
        </button>
      </form>

      {showAutocomplete && allResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          {allResults.map((item) => (
            <Link
              key={item.id}
              href={item.type === 'company' ? `/company/${item.slug}` : `/categories/${item.slug}`}
              onClick={handleResultClick}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
            >
              {item.type === 'company' ? (
                <>
                  <Building2 size={20} className="text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="font-semibold text-slate-900 truncate">
                      <HighlightMatch text={item.name} query={query.trim()} />
                    </div>
                    <div className="text-xs text-slate-500">
                      <HighlightMatch text={item.category.name} query={query.trim()} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Folder size={20} className="text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="font-semibold text-slate-900 truncate">
                      <HighlightMatch text={item.name} query={query.trim()} />
                    </div>
                    <div className="text-xs text-slate-500">Категорія</div>
                  </div>
                </>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
