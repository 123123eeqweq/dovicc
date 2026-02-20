import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { getCategory, getCategories } from '@/lib/api';
import { CategoryFilters } from '@/components/categories/CategoryFilters';
import { CategoryImage } from '@/components/categories/CategoryImage';
import { CategorySEOText } from '@/components/seo/CategorySEOText';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { truncateDescription, getHreflangAlternates } from '@/lib/seo';
import { BASE_URL } from '@/lib/constants';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let category;
  try {
    category = await getCategory(slug);
  } catch (error) {
    return {
      title: 'Категорія не знайдена | DOVI',
      description: 'Сторінка категорії не знайдена.',
    };
  }

  if (!category) {
    return {
      title: 'Категорія не знайдена | DOVI',
      description: 'Сторінка категорії не знайдена.',
    };
  }

  const canonicalUrl = `${BASE_URL}/categories/${slug}`;
  const desc = truncateDescription(`Відгуки про ${category.name.toLowerCase()} в Україні. Реальний досвід клієнтів, рейтинги компаній.`);

  return {
    title: `${category.name} — відгуки клієнтів | DOVI`,
    description: desc,
    keywords: [`${category.name} відгуки`, `${category.name} Україна`, 'відгуки клієнтів', 'рейтинг компаній', 'dovi'],
    openGraph: {
      title: `${category.name} — відгуки клієнтів | DOVI`,
      description: desc,
      url: canonicalUrl,
      siteName: 'DOVI',
      images: [
        {
          url: `${BASE_URL}/images/logo.png`,
          width: 1200,
          height: 630,
          alt: `${category.name} — категорія на DOVI`,
        },
      ],
      locale: 'uk_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} — відгуки клієнтів | DOVI`,
      description: desc,
      images: [`${BASE_URL}/images/logo.png`],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: getHreflangAlternates(canonicalUrl),
    },
  };
}

export default async function CategoryListing({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let category;
  try {
    category = await getCategory(slug);
  } catch (error) {
    notFound();
  }

  if (!category) {
    notFound();
  }

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Головна', url: BASE_URL },
          { name: 'Категорії', url: `${BASE_URL}/categories` },
          { name: category.name, url: `${BASE_URL}/categories/${slug}` },
        ]}
      />

      <div className="relative w-full min-h-[200px] h-52 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-slate-700">
        <CategoryImage
          slug={slug}
          className="object-cover"
          sizes="100vw"
          priority
          fallbackClassName="bg-slate-600"
        />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="absolute inset-0 flex flex-col justify-end pt-16 md:pt-0">
          <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pb-4 sm:pb-6 md:pb-8">
            <Breadcrumb
              items={[
                { label: 'Головна', href: '/' },
                { label: 'Категорії', href: '/categories' },
                { label: category.name },
              ]}
              className="mb-2 sm:mb-3 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white/60 [&_svg]:text-white/50 [&_ol]:text-xs [&_ol]:sm:text-sm"
            />
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                {category.name}
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl text-xs md:text-sm shrink-0 text-white border border-white/30">
                <Building2 size={14} className="shrink-0 md:w-4 md:h-4" />
                <span className="font-bold" id="companies-count">{category.companies.length}</span>
                <span className="opacity-90">{category.companies.length === 1 ? 'компанія' : category.companies.length < 5 ? 'компанії' : 'компаній'}</span>
              </span>
            </div>
            <p className="mt-1.5 sm:mt-2 text-white/90 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
              {category.description ? (
                <>{category.description} На платформі DOVI — рейтинги, чесні відгуки та актуальна інформація про компанії.</>
              ) : (
                <>Досліджуйте найкращі компанії. Рейтинги, чесні відгуки та актуальна інформація для прийняття правильних рішень.</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-4 sm:pt-6 pb-6 md:py-10 -mt-2 relative z-10">

      {category.companies.length === 0 ? (
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200/80 p-8 md:p-16 text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
          <div className="max-w-md mx-auto">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-xl md:rounded-2xl bg-slate-100 flex items-center justify-center">
              <Building2 size={28} className="text-slate-400 md:w-8 md:h-8" />
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">
              У цій категорії поки що немає компаній
            </h2>
            <p className="text-slate-600 text-sm md:text-base mb-6 md:mb-8 leading-relaxed">
              Станьте першим, хто додасть компанію. Ваш внесок допоможе іншим знайти потрібні послуги.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link
                href="/review/add"
                className="h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-[0_4px_16px_-4px_rgba(5,150,105,0.5)]"
              >
                <Plus size={20} />
                Додати
              </Link>
              <Link
                href="/categories"
                className="h-12 px-6 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Усі категорії
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <CategoryFilters companies={category.companies} />
          <CategorySEOText 
            category={category}
            companiesCount={category.companies.length}
            showSEO={true}
          />
        </>
      )}
      </div>
    </>
  );
}
