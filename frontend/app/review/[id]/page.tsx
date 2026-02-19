import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { getReview, getCompanyReviews, getImageSrc } from '@/lib/api';
import { truncateDescription, getHreflangAlternates } from '@/lib/seo';
import { ShareButton } from '@/components/company/ShareButton';
import { ReviewReactions } from '@/components/review/ReviewReactions';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ReviewSchema } from '@/components/seo/ReviewSchema';
import { BASE_URL } from '@/lib/constants';
import { getInitials, formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const canonicalUrl = `${BASE_URL}/review/${id}`;
  
  try {
    const review = await getReview(id);
    const description = truncateDescription(review.text);
    const ogImage = `${BASE_URL}/images/logo.png`;

    return {
      title: `Відгук про ${review.company.name} | DOVI`,
      description: description,
      keywords: [`${review.company.name} відгук`, 'відгук клієнта', 'dovi'],
      openGraph: {
        title: `Відгук про ${review.company.name} | DOVI`,
        description: description,
        url: canonicalUrl,
        siteName: 'DOVI',
        type: 'article',
        locale: 'uk_UA',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `Відгук про ${review.company.name}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Відгук про ${review.company.name} | DOVI`,
        description: description,
        images: [ogImage],
      },
      alternates: {
        canonical: canonicalUrl,
        languages: getHreflangAlternates(canonicalUrl),
      },
    };
  } catch {
    return {
      title: 'Відгук не знайдено | DOVI',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let review;
  try {
    review = await getReview(id);
  } catch {
    notFound();
  }

  let otherReviews: Awaited<ReturnType<typeof getCompanyReviews>> = [];
  try {
    const allReviews = await getCompanyReviews(review.company.slug);
    otherReviews = allReviews.filter((r) => r.id !== id).slice(0, 3);
  } catch {
    // ignore
  }

  const company = review.company;
  const initials = getInitials(review.user.name);
  const dateText = formatDate(review.createdAt);

  const breadcrumbItems = [
    { name: 'Головна', url: BASE_URL },
    { name: 'Категорії', url: `${BASE_URL}/categories` },
    { name: company.category.name, url: `${BASE_URL}/categories/${company.category.slug}` },
    { name: company.name, url: `${BASE_URL}/company/${company.slug}` },
    { name: `Відгук про ${company.name}`, url: `${BASE_URL}/review/${id}` },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
      <ReviewSchema review={review} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <Breadcrumb
        items={[
          { label: 'Головна', href: '/' },
          { label: 'Категорії', href: '/categories' },
          { label: review.company.category.name, href: `/categories/${review.company.category.slug}` },
          { label: review.company.name, href: `/company/${review.company.slug}` },
          { label: `Відгук #${id.substring(0, 8)}` },
        ]}
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <article className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {review.user.avatarUrl ? (
                  <div className="relative size-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-200">
                    <Image
                      src={getImageSrc(review.user.avatarUrl)}
                      alt={`Аватар автора відгуку ${review.user.name}`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-bold border border-slate-200/80">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg truncate break-words">{review.user.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-sm text-slate-500">{dateText}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex text-amber-500 text-[20px] mb-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Icon 
                      key={i} 
                      name="star" 
                      filled={i <= review.rating}
                      className={i <= review.rating ? "" : "text-slate-200"} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-600">Оцінка: {review.rating}</span>
              </div>
            </div>
            <div className="prose prose-slate max-w-3xl text-slate-700 leading-relaxed mb-8 text-sm md:text-base">
              {review.title && (
                <h2 className="text-xl font-bold text-slate-900 mb-4 break-words">{review.title}</h2>
              )}
              <p className="whitespace-pre-wrap break-words">{review.text}</p>
            </div>
            {(review.pros || review.cons) && (
              <div className="grid md:grid-cols-2 gap-6 mb-8 min-w-0">
                {review.pros && (
                  <div className="bg-emerald-50/80 rounded-xl p-5 border border-emerald-200/80 min-w-0 overflow-hidden">
                    <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3 shrink-0">
                      <Icon name="add_circle" /> Плюси
                    </h4>
                    <ul className="space-y-2 min-w-0">
                      {review.pros.split('\n').filter(line => line.trim()).length > 0 ? (
                        review.pros.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 min-w-0">
                            <Icon name="check" className="text-emerald-600 text-[18px] mt-0.5 shrink-0" /> 
                            <span className="break-words min-w-0 overflow-wrap-anywhere">{line.trim()}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2 text-sm text-slate-700 min-w-0">
                          <Icon name="check" className="text-emerald-600 text-[18px] mt-0.5 shrink-0" /> 
                          <span className="break-words min-w-0 overflow-wrap-anywhere">{review.pros}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {review.cons && (
                  <div className="bg-red-50/80 rounded-xl p-5 border border-red-200/80 min-w-0 overflow-hidden">
                    <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3 shrink-0">
                      <Icon name="do_not_disturb_on" /> Мінуси
                    </h4>
                    <ul className="space-y-2 min-w-0">
                      {review.cons.split('\n').filter(line => line.trim()).length > 0 ? (
                        review.cons.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 min-w-0">
                            <Icon name="close" className="text-red-500 text-[18px] mt-0.5 shrink-0" /> 
                            <span className="break-words min-w-0 overflow-wrap-anywhere">{line.trim()}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2 text-sm text-slate-700 min-w-0">
                          <Icon name="close" className="text-red-500 text-[18px] mt-0.5 shrink-0" /> 
                          <span className="break-words min-w-0 overflow-wrap-anywhere">{review.cons}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-200/80 pt-6">
              <ReviewReactions
                reviewId={review.id}
                initialLikesCount={review.likesCount}
                initialDislikesCount={review.dislikesCount}
                initialUserReaction={review.userReaction}
              />
              <ShareButton url={`/review/${id}`} title={`Відгук про ${review.company.name}`} />
            </div>
          </article>

        </div>
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] sticky top-24">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="size-20 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden mb-4 border border-slate-200/80">
                <span className="font-black text-slate-800 text-3xl">{review.company.name.substring(0, 2).toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1 break-words px-2">{review.company.name}</h2>
              <p className="text-sm text-slate-500 mb-3 break-words px-2">{review.company.category.name}</p>
              <div className="flex items-center gap-1.5 text-amber-500 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                <Icon name="star" filled className="text-[16px]" />
                <span className="text-slate-900">{review.company.rating.toFixed(1)}</span>
                <span className="text-slate-400">•</span>
                <Link href={`/company/${review.company.slug}`} className="text-slate-500 hover:text-emerald-600 hover:underline">
                  {review.company.reviewCount} відгуків
                </Link>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Icon name="location_on" className="text-slate-400 text-[20px]" />
                <span className="flex-1 break-words">{company.city || 'Україна'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link 
                href={`/company/${review.company.slug}`}
                className="h-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)]"
              >
                Відвідати
              </Link>
              <Link 
                href={`/company/${review.company.slug}`}
                className="h-10 flex items-center justify-center rounded-xl border border-slate-200/80 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Профіль
              </Link>
            </div>
            {company.ratingDistribution?.length ? (
              <div className="border-t border-slate-200/80 pt-6">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Статистика</p>
                <h4 className="font-bold text-slate-900 text-sm mb-4">Рейтинг</h4>
                <div className="space-y-2">
                  {company.ratingDistribution.map((stat) => {
                    const color = stat.rating >= 4 ? 'bg-emerald-600' : stat.rating === 3 ? 'bg-amber-400' : 'bg-red-400';
                    return (
                      <div key={stat.rating} className="flex items-center gap-3 text-xs">
                        <span className="w-3 font-medium text-slate-600">{stat.rating}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${stat.percentage}%` }}></div>
                        </div>
                        <span className="w-8 text-right text-slate-400">{stat.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
      {otherReviews.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200/80">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Більше відгуків</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Інші відгуки про {review.company.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherReviews.map((otherReview) => {
              const otherInitials = getInitials(otherReview.user.name);
              return (
                <Link 
                  key={otherReview.id}
                  href={`/review/${otherReview.id}`}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] hover:border-emerald-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {otherReview.user.avatarUrl ? (
                        <div className="relative size-8 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={getImageSrc(otherReview.user.avatarUrl)}
                            alt={`Аватар ${otherReview.user.name}`}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200/80">
                          {otherInitials}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-slate-900 truncate break-words max-w-[120px] md:max-w-[150px] xl:max-w-none">{otherReview.user.name}</span>
                    </div>
                    <div className="hidden xl:flex text-amber-500 text-[14px] shrink-0">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Icon 
                          key={i} 
                          name="star" 
                          filled={i <= otherReview.rating}
                          className={i <= otherReview.rating ? "" : "text-slate-200"} 
                        />
                      ))}
                    </div>
                    <div className="flex xl:hidden items-center gap-1 text-amber-500 shrink-0">
                      <span className="text-xs font-semibold text-slate-700">{otherReview.rating}</span>
                      <Icon 
                        name="star" 
                        filled={true}
                        className="text-[12px]"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3 break-words group-hover:text-emerald-600 transition-colors">
                    {otherReview.title ? (
                      <>
                        <span className="font-semibold text-slate-800">{otherReview.title}</span>
                        {otherReview.text && ` — ${otherReview.text}`}
                      </>
                    ) : (
                      otherReview.text
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
