import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageSquare, Star, MapPin } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { getCompany, getCompanyReviews, getCompanies } from '@/lib/api';
import { CompanyReviewsSection } from '@/components/company/CompanyReviewsSection';
import { ShareButton } from '@/components/company/ShareButton';
import { BusinessAccessButton } from '@/components/company/BusinessAccessButton';
import { CompanyTabs } from '@/components/company/CompanyTabs';
import { CompanySchema } from '@/components/seo/CompanySchema';
import { CompanySEOText } from '@/components/seo/CompanySEOText';
import { CompanyLogo } from '@/components/company/CompanyLogo';
import { truncateDescription, getHreflangAlternates } from '@/lib/seo';
import { BASE_URL } from '@/lib/constants';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  try {
    const companies = await getCompanies({ limit: 200, sort: 'reviews_desc' });
    return companies.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const search = searchParams ? await searchParams : {};
  
  const hasQueryParams = Object.keys(search).length > 0;
  
  let company;
  try {
    company = await getCompany(slug);
  } catch (error) {
    return {
      title: 'Об\'єкт не знайдено | DOVI',
      description: 'Сторінка об\'єкта не знайдена.',
    };
  }

  const canonicalUrl = `${BASE_URL}/company/${slug}`;
  const desc = truncateDescription(`Відгуки про ${company.name}. Рейтинг ${company.rating.toFixed(1)}, ${company.reviewCount} відгуків. Реальний досвід покупців.`);

  const logoUrl = company.logoUrl
    ? `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001'}${company.logoUrl}`
    : `${BASE_URL}/images/logo.png`;

  return {
    title: `${company.name} — відгуки клієнтів, рейтинг та досвід | DOVI`,
    description: desc,
    keywords: [`${company.name} відгуки`, `${company.name} рейтинг`, `${company.category.name}`, 'відгуки клієнтів', 'dovi'],
    openGraph: {
      title: `${company.name} — відгуки клієнтів | DOVI`,
      description: desc,
      url: canonicalUrl,
      siteName: 'DOVI',
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: `${company.name} — логотип`,
        },
      ],
      locale: 'uk_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} — відгуки клієнтів | DOVI`,
      description: desc,
      images: [logoUrl],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: getHreflangAlternates(canonicalUrl),
    },
    robots: hasQueryParams
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export default async function CompanyProfile({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const search = await searchParams || {};
  
  const hasQueryParams = Object.keys(search).length > 0;

  const sort = (search.sort as string) || 'newest';
  const rating = search.rating ? parseInt(search.rating as string, 10) : undefined;
  const withText = search.withText === 'true';
  const minUseful = search.minUseful ? parseInt(search.minUseful as string, 10) : undefined;
  const page = search.page ? parseInt(search.page as string, 10) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let company;
  let reviews;
  try {
    [company, reviews] = await Promise.all([
      getCompany(slug),
      getCompanyReviews(slug, false, {
        sort: sort as 'newest' | 'rating_desc' | 'rating_asc' | 'useful',
        rating,
        withText: withText || undefined,
        minUseful,
        limit,
        offset,
      }),
    ]);
  } catch (error) {
    notFound();
  }



  const totalPages = Math.max(1, Math.ceil(company.reviewCount / limit));

  const similarCompanies = await getCompanies({ category: company.category.slug, limit: 4 });

  const approvedReviewsForSchema = reviews
    .filter((review: any) => !review.status || review.status === 'approved')
    .slice(0, 3)
    .map((review: any) => ({
      id: review.id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      user: {
        name: review.user.name,
      },
    }));

  return (
    <div className="min-h-screen">
    <>
      <CompanySchema 
        company={{
          id: company.id,
          name: company.name,
          slug: company.slug,
          description: company.description,
          city: company.city,
          rating: company.rating,
          reviewCount: company.reviewCount,
          category: company.category,
          website: null
        }}
        reviews={approvedReviewsForSchema}
      />
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-16 pb-10 md:py-10">
      <Breadcrumb
        items={[
          { label: 'Головна', href: '/' },
          { label: company.category.name, href: `/categories/${company.category.slug}` },
          { label: company.name },
        ]}
        className="mb-8"
      />

      <div className="mb-10">
        <div className="flex flex-row gap-4 md:gap-6 items-start">
          <div className="shrink-0">
            <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="md" />
          </div>
          <div className="flex-1 min-w-0 space-y-2 md:space-y-3 text-left">
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-semibold mb-0.5">{company.category.name}</p>
              <h1 className="text-xl md:text-4xl font-bold text-slate-900 tracking-tight break-words leading-tight">
                {company.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 items-center">
              <ShareButton url={`/company/${slug}`} title={company.name} />
              <Link href={`/review/add?company=${slug}`} className="h-9 md:h-10 px-4 md:px-5 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs md:text-sm transition-all shadow-[0_2px_12px_-4px_rgba(5,150,105,0.4)] hover:shadow-[0_4px_20px_-4px_rgba(5,150,105,0.5)] whitespace-nowrap">
                <MessageSquare size={18} className="mr-1.5 md:mr-2 md:w-5 md:h-5" />
                Написати відгук
              </Link>
            </div>
            <div className="flex items-center flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg text-xs md:text-sm">
                  {company.rating.toFixed(1)} <Star size={14} className="fill-amber-500 text-amber-500" />
                </span>
                <span className="text-slate-500 font-medium">{company.reviewCount} {company.reviewCount === 1 ? 'відгук' : company.reviewCount < 5 ? 'відгуки' : 'відгуків'}</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="text-slate-600 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400 md:w-[18px] md:h-[18px]" />
                {company.city || 'Україна'}
              </div>
            </div>

          </div>
        </div>

        <CompanyTabs reviewCount={company.reviewCount}>
          {{
            reviews: (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-4 md:p-6 mb-8">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Статистика</p>
                    <h3 className="font-bold text-lg text-slate-900 mb-4 md:mb-6">Рейтинг</h3>
                    <div className="flex flex-row items-center gap-4 md:gap-12">
                      <div className="flex-1 min-w-0 space-y-2 md:space-y-3 order-1 md:order-2">
                         {(company.ratingDistribution && company.ratingDistribution.length > 0
                           ? company.ratingDistribution
                           : [5, 4, 3, 2, 1].map(rating => ({ rating, count: 0, percentage: 0 }))
                         ).map((stat) => {
                            const width = `${stat.percentage}%`;
                            const color = stat.rating >= 4 ? 'bg-emerald-600' : stat.rating === 3 ? 'bg-amber-400' : 'bg-red-400';
                            return (
                                <div key={stat.rating} className="flex items-center gap-2 md:gap-3 text-sm">
                                    <span className="font-medium w-3 text-slate-600 shrink-0">{stat.rating}</span>
                                    <Star className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${stat.rating >= 4 ? 'text-amber-500 fill-current' : 'text-slate-300'}`} />
                                    <div className="flex-1 min-w-0 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${color} rounded-full`} style={{ width }}></div>
                                    </div>
                                    <span className="w-7 md:w-8 text-right text-slate-500 shrink-0 text-xs md:text-sm">{stat.percentage}%</span>
                                </div>
                            );
                         })}
                      </div>
                      <div className="flex flex-col items-center justify-center shrink-0 order-2 md:order-1">
                        <div className="relative size-20 md:size-32">
                           <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-2 border-slate-200/80 flex items-center justify-center">
                              <div className="text-center">
                                 <span className="text-2xl md:text-4xl font-bold text-slate-900 block">{company.rating.toFixed(1)}</span>
                                 <span className="text-[10px] md:text-xs text-slate-500 font-medium">з 5</span>
                              </div>
                           </div>
                           <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                              <circle 
                                cx="64" 
                                cy="64" 
                                r="62" 
                                stroke="#059669" 
                                strokeWidth="4" 
                                fill="none" 
                                strokeDasharray="389" 
                                strokeDashoffset={389 - (company.rating / 5) * 389} 
                                strokeLinecap="round" 
                              />
                           </svg>
                        </div>
                        <div className="text-center mt-3">
                          <div className="text-xs md:text-sm font-medium text-slate-900">Дуже добре</div>
                          <div className="text-[10px] md:text-xs text-slate-500">на основі {company.reviewCount} оцінок</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CompanyReviewsSection companySlug={slug} initialReviews={reviews} totalPages={totalPages} currentPage={page} />
                  <CompanySEOText 
                    company={company}
                    showSEO={!hasQueryParams && page === 1}
                  />
                </div>

                <aside className="w-full lg:w-80 shrink-0 space-y-6 sticky top-24 self-start">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-6">
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Рекомендації</p>
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Схожі</h3>
                        <div className="space-y-2">
                             {similarCompanies.filter(c => c.slug !== company.slug).slice(0, 3).map(similar => (
                                <Link href={`/company/${similar.slug}`} key={similar.id} className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                                    <CompanyLogo logoUrl={similar.logoUrl} name={similar.name} size="sm" variant="simple" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{similar.name}</h4>
                                        <div className="flex items-center text-xs text-slate-500">
                                            <span className="text-amber-500 mr-1">★</span> {similar.rating.toFixed(1)} • {similar.reviewCount} відгуків
                                        </div>
                                    </div>
                                </Link>
                             ))}
                        </div>
                        <Link href={`/categories/${company.category.slug}`} className="block mt-4 text-sm text-emerald-600 font-medium hover:underline text-center">Дивитись всі в категорії</Link>
                    </div>

                    <div className="rounded-2xl bg-emerald-600 p-6 text-white text-center relative overflow-hidden shadow-[0_4px_16px_-4px_rgba(5,150,105,0.4)] border border-emerald-700/30">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Star size={96} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 relative z-10">Ви власник / представник?</h3>
                        <p className="text-emerald-100 text-sm mb-4 relative z-10">Керуйте сторінкою, відповідайте на відгуки та залучайте клієнтів.</p>
                        <BusinessAccessButton />
                    </div>
                </aside>
              </div>
            ),
            about: (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-6 md:p-8">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Про компанію</p>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Деталі</h2>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap max-w-3xl break-words">
                        {company.description || 'Інформація відсутня.'}
                      </p>
                    </div>
                  </div>
                </div>

                <aside className="w-full lg:w-80 shrink-0 space-y-6 sticky top-24 self-start">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-6">
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Рекомендації</p>
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Схожі</h3>
                        <div className="space-y-2">
                             {similarCompanies.filter(c => c.slug !== company.slug).slice(0, 3).map(similar => (
                                <Link href={`/company/${similar.slug}`} key={similar.id} className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                                    <CompanyLogo logoUrl={similar.logoUrl} name={similar.name} size="sm" variant="simple" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{similar.name}</h4>
                                        <div className="flex items-center text-xs text-slate-500">
                                            <span className="text-amber-500 mr-1">★</span> {similar.rating.toFixed(1)} • {similar.reviewCount} відгуків
                                        </div>
                                    </div>
                                </Link>
                             ))}
                        </div>
                        <Link href={`/categories/${company.category.slug}`} className="block mt-4 text-sm text-emerald-600 font-medium hover:underline text-center">Дивитись всі в категорії</Link>
                    </div>

                    <div className="rounded-2xl bg-emerald-600 p-6 text-white text-center relative overflow-hidden shadow-[0_4px_16px_-4px_rgba(5,150,105,0.4)] border border-emerald-700/30">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Star size={96} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 relative z-10">Ви власник / представник?</h3>
                        <p className="text-emerald-100 text-sm mb-4 relative z-10">Керуйте сторінкою, відповідайте на відгуки та залучайте клієнтів.</p>
                        <BusinessAccessButton />
                    </div>
                </aside>
              </div>
            ),
          }}
        </CompanyTabs>
      </div>
    </div>
    </>
    </div>
  );
}
