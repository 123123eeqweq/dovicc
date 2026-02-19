import { fetchAPI } from './common';

export async function getCategories() {
  return fetchAPI<Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    companiesCount: number;
  }>>('/categories', {
    revalidate: 300,
    tags: ['categories'],
  });
}

export async function getCategory(slug: string) {
  return fetchAPI<{
    id: string;
    name: string;
    slug: string;
    description: string;
    companies: Array<{
      id: string;
      name: string;
      slug: string;
      rating: number;
      reviewCount: number;
    }>;
  }>(`/categories/${slug}`, {
    revalidate: 300,
    tags: [`category:${slug}`],
  });
}
