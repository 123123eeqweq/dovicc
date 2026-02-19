import { BASE_URL } from '@/lib/constants';

interface CompanySchemaProps {
  company: {
    id: string;
    name: string;
    slug: string;
    description: string;
    city: string;
    rating: number;
    reviewCount: number;
    category: {
      name: string;
      slug: string;
    };
    website?: string | null;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    text: string;
    createdAt: string;
    user: {
      name: string;
    };
  }>;
}

export function CompanySchema({ company, reviews = [] }: CompanySchemaProps) {
  const companyUrl = `${BASE_URL}/company/${company.slug}`;
  const organizationSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    description: company.description,
    url: company.website || companyUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.city,
      addressCountry: 'UA',
    },
    ...(company.website && { sameAs: [company.website] }),
  };

  if (company.reviewCount > 0) {
    organizationSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: company.rating.toFixed(1),
      reviewCount: company.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const reviewItems = reviews.slice(0, 3).map((review) => ({
    '@type': 'Review' as const,
    itemReviewed: { '@type': 'Organization' as const, name: company.name },
    author: { '@type': 'Person' as const, name: review.user.name },
    reviewRating: {
      '@type': 'Rating' as const,
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    datePublished: new Date(review.createdAt).toISOString(),
  }));

  if (reviewItems.length > 0) {
    organizationSchema.review = reviewItems;
  }

  const breadcrumbItems = [
    { position: 1, name: 'Головна', item: BASE_URL },
    { position: 2, name: 'Категорії', item: `${BASE_URL}/categories` },
    { position: 3, name: company.category.name, item: `${BASE_URL}/categories/${company.category.slug}` },
    { position: 4, name: company.name, item: companyUrl },
  ].map((item) => ({
    '@type': 'ListItem',
    position: item.position,
    name: item.name,
    item: item.item,
  }));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
