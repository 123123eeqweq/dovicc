import { fetchAPI, fetchAPIAuth, API_URL } from './common';

export async function getCompanies(params?: {
  category?: string;
  city?: string;
  limit?: number;
  offset?: number;
  sort?: 'reviews_desc' | 'rating_desc';
  cache?: RequestCache;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append('category', params.category);
  if (params?.city) searchParams.append('city', params.city);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  const query = searchParams.toString();
  const tags = ['companies'];
  if (params?.category) {
    tags.push(`category:${params.category}`);
  }

  return fetchAPI<Array<{
    id: string;
    name: string;
    slug: string;
    rating: number;
    reviewCount: number;
    logoUrl: string | null;
    city: string;
    category: {
      name: string;
      slug: string;
    };
  }>>(`/companies${query ? `?${query}` : ''}`, {
    revalidate: params?.cache ? undefined : 60,
    cache: params?.cache ?? 'default',
    tags,
  });
}

export async function getCompany(slug: string) {
  return fetchAPI<{
    id: string;
    name: string;
    slug: string;
    description: string;
    city: string;
    rating: number;
    reviewCount: number;
    logoUrl: string | null;
    ratingDistribution?: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
      description: string;
    };
  }>(`/companies/${slug}`, {
    revalidate: 60,
    tags: [`company:${slug}`],
  });
}

export async function getCompanyReviews(
  slug: string,
  withAuth = false,
  params?: {
    sort?: 'newest' | 'rating_desc' | 'rating_asc' | 'useful';
    rating?: number;
    withText?: boolean;
    minUseful?: number;
    limit?: number;
    offset?: number;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.sort) searchParams.append('sort', params.sort);
  if (params?.rating) searchParams.append('rating', params.rating.toString());
  if (params?.withText) searchParams.append('withText', 'true');
  if (params?.minUseful) searchParams.append('minUseful', params.minUseful.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const query = searchParams.toString();
  const endpoint = `/companies/${slug}/reviews${query ? `?${query}` : ''}`;

  if (withAuth) {
    return fetchAPIAuth<Array<{
      id: string;
      title?: string | null;
      rating: number;
      text: string;
      pros: string | null;
      cons: string | null;
      status?: string;
      likesCount: number;
      dislikesCount: number;
      userReaction: number | null;
      createdAt: string;
      user: {
        name: string;
        avatarUrl: string | null;
      };
    }>>(endpoint);
  }
  
  const cacheOptions = params && (params.sort || params.rating || params.withText || params.minUseful)
    ? { cache: 'no-store' as RequestCache }
    : {
        revalidate: 30,
        tags: [`company:${slug}`, `company:${slug}:reviews`],
      };

  return fetchAPI<Array<{
    id: string;
    title?: string | null;
    rating: number;
    text: string;
    pros: string | null;
    cons: string | null;
    status?: string;
    likesCount: number;
    dislikesCount: number;
    userReaction: number | null;
    createdAt: string;
    user: {
      name: string;
      avatarUrl: string | null;
    };
  }>>(endpoint, cacheOptions);
}

export async function proposeCompany(data: {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  website?: string;
  city?: string;
  logo?: File;
}) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('slug', data.slug);
  formData.append('categoryId', data.categoryId);
  if (data.description) formData.append('description', data.description);
  if (data.website) formData.append('website', data.website);
  if (data.city) formData.append('city', data.city);
  if (data.logo) formData.append('logo', data.logo);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/companies/propose`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const error = new Error(errorData.error || `API error: ${response.status}`) as any;
      error.status = response.status;
      error.errorCode = errorData.error;
      throw error;
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Час очікування вичерпано. Спробуйте ще раз.') as any;
      timeoutError.status = 0;
      timeoutError.errorCode = 'TIMEOUT_ERROR';
      throw timeoutError;
    }
    if (error.message === 'fetch failed' || error.code === 'ECONNREFUSED' || error.name === 'TypeError') {
      const connectionError = new Error(`Не вдалося підключитися до сервера. Перевірте, чи запущений backend на ${API_URL}`) as any;
      connectionError.status = 0;
      connectionError.errorCode = 'CONNECTION_ERROR';
      throw connectionError;
    }
    throw error;
  }
}
