import { fetchAPI } from './common';

export async function search(query: string) {
  if (!query || query.trim().length === 0) {
    return {
      companies: [],
      categories: [],
    };
  }

  const data = await fetchAPI<{
    companies: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      city: string;
      rating: number;
      reviewCount: number;
      logoUrl: string | null;
      category: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
    }>;
  }>(`/search?q=${encodeURIComponent(query.trim())}`, {
    cache: 'no-store',
  });

  return {
    companies: data.companies,
    categories: data.categories,
  };
}

export async function searchAutocomplete(query: string, limit?: number) {
  if (!query || query.trim().length === 0) {
    return {
      companies: [],
      categories: [],
    };
  }

  const params = new URLSearchParams({ q: query.trim() });
  if (limit !== undefined) params.set('limit', String(limit));

  const data = await fetchAPI<{
    companies: Array<{
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      category: {
        name: string;
        slug: string;
      };
    }>;
    categories: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>(`/search/autocomplete?${params.toString()}`, {
    cache: 'no-store',
  });

  return {
    companies: data.companies,
    categories: data.categories,
  };
}
