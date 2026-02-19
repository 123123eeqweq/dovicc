import { BASE_URL } from '@/lib/constants';

interface ReviewSchemaProps {
  review: {
    id: string;
    title: string | null;
    rating: number;
    text: string;
    createdAt: string;
    user: { name: string };
    company: {
      name: string;
      slug: string;
      rating: number;
      reviewCount: number;
      category?: { name: string; slug: string };
    };
  };
}

export function ReviewSchema({ review }: ReviewSchemaProps) {
  const companyUrl = `${BASE_URL}/company/${review.company.slug}`;
  const reviewUrl = `${BASE_URL}/review/${review.id}`;

  const organizationWithRating: Record<string, unknown> = {
    '@type': 'Organization',
    name: review.company.name,
    url: companyUrl,
    ...(review.company.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: review.company.rating.toFixed(1),
        reviewCount: review.company.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': reviewUrl,
    itemReviewed: organizationWithRating,
    author: {
      '@type': 'Person',
      name: review.user.name,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    name: review.title || undefined,
    datePublished: new Date(review.createdAt).toISOString(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
    />
  );
}
