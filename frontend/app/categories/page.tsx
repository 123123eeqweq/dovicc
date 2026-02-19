import Link from 'next/link';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { getCategories } from '@/lib/api';
import { CategoriesList } from '@/components/categories/CategoriesList';
import { getHreflangAlternates } from '@/lib/seo';
import { BASE_URL } from '@/lib/constants';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Категорії',
  description: 'Всі категорії компаній на DOVI. Знайдіть найкращі компанії та послуги у будь-якій сфері.',
  alternates: {
    canonical: `${BASE_URL}/categories`,
    languages: getHreflangAlternates(`${BASE_URL}/categories`),
  },
};

export default async function Categories() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  
  try {
    categories = await getCategories();
  } catch (error) {
    if (error instanceof Error && error.message !== 'CONNECTION_ERROR') {
      console.error('Error fetching data:', error);
    }
  }

  return (
    <>
      <section className="py-8 md:py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <Breadcrumb
            items={[
              { label: 'Головна', href: '/' },
              { label: 'Всі категорії' },
            ]}
            className="mb-6 md:mb-8"
          />

          <div className="mb-8 md:mb-12 max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 md:mb-3">Каталог</p>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3 md:mb-4">
              Категорії
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed">
              Знайдіть найкращі компанії та послуги у будь-якій сфері. Перевірені бізнеси, розподілені за зручними категоріями.
            </p>
          </div>

          <CategoriesList categories={categories} />
        </div>
      </section>
    </>
  );
}
