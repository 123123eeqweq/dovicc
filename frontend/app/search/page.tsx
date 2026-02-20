import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryImage } from '@/components/categories/CategoryImage';
import { Search, Star, MapPin, Building2, Plus } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { search as searchAPI } from '@/lib/api';
import { SearchSEOText } from '@/components/seo/SearchSEOText';
import type { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = (params.q as string) || '';

  return {
    title: q ? `Результати пошуку за "${q}" | DOVI` : 'Пошук | DOVI',
    description: `Результати пошуку за "${q}"`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = (params.q as string) || '';

  if (!q || q.trim().length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-20 pb-10 md:py-10">
        <Breadcrumb
          items={[
            { label: 'Головна', href: '/' },
            { label: 'Пошук' },
          ]}
          className="mb-8"
        />

        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Введіть запит для пошуку</h1>
          <p className="text-slate-600">Знайдіть компанії та категорії на нашому сайті</p>
        </div>
      </div>
    );
  }

  let results;
  try {
    results = await searchAPI(q);
  } catch (error) {
    notFound();
  }

  const hasResults = results.companies.length > 0 || results.categories.length > 0;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-20 pb-10 md:py-10">
      <Breadcrumb
        items={[
          { label: 'Головна', href: '/' },
          { label: 'Пошук' },
        ]}
        className="mb-8"
      />

      <div className="mb-8 overflow-hidden">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 break-words">
          Результати пошуку за &quot;{q}&quot;
        </h1>
        <p className="text-slate-600">
          Знайдено: {results.companies.length} компаній, {results.categories.length} категорій
        </p>
      </div>

      {!hasResults ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <Search size={64} className="mx-auto text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Ми не знайшли результатів за запитом &quot;{q}&quot;
            </h2>
            <div className="text-slate-600 mb-8 space-y-2">
              <p>Спробуйте:</p>
              <ul className="list-disc list-inside text-left max-w-xs mx-auto space-y-1">
                <li>Перевірте написання</li>
                <li>Спробуйте інші ключові слова</li>
                <li>Використайте більш загальний запит</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/review/add"
                className="h-12 px-6 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/20"
              >
                <Plus size={20} className="mr-2" />
                Додати
              </Link>
              <Link
                href="/categories"
                className="h-12 px-6 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Перейти до категорій
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {results.companies.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 size={24} />
                Компанії ({results.companies.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/company/${company.slug}`}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all hover:border-emerald-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 break-words">{company.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-600 mb-2 flex-wrap">
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={16} className="text-yellow-400 fill-current shrink-0" />
                            <span className="font-semibold">{company.rating.toFixed(1)}</span>
                          </div>
                          <span className="shrink-0">•</span>
                          <span className="shrink-0">{company.reviewCount} відгуків</span>
                          <span className="shrink-0">•</span>
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{company.city || 'Україна'}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 break-words">{company.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs text-emerald-600 font-medium truncate break-words min-w-0 flex-1">{company.category.name}</span>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">Детальніше →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.categories.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 size={24} />
                Категорії ({results.categories.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:border-emerald-500"
                  >
                    <div className="relative h-24 sm:h-28 overflow-hidden bg-slate-100">
                      <CategoryImage
                        slug={category.slug}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw, 33vw"
                      />
                    </div>
                    <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 break-words">{category.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 break-words">{category.description}</p>
                    <span className="text-xs text-emerald-600 font-medium">Переглянути категорію →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      
      {hasResults && (
        <SearchSEOText 
          query={q}
          companiesCount={results.companies.length}
          categoriesCount={results.categories.length}
          showSEO={q.length >= 3}
        />
      )}
    </div>
  );
}
