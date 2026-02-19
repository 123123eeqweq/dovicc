import { fetchAPIAuth, API_URL } from './common';

export async function getCompanyProposals(params?: { limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const query = searchParams.toString();
  return fetchAPIAuth<Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    website: string | null;
    city: string;
    status: string;
    createdAt: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
  }>>(`/admin/companies/proposals${query ? `?${query}` : ''}`);
}

export async function approveCompanyProposal(proposalId: string, data?: {
  name?: string;
  slug?: string;
  description?: string;
  website?: string;
  city?: string;
  categoryId?: string;
  logoFile?: File | null;
  removeLogo?: boolean;
}) {
  if (data?.logoFile || data?.removeLogo) {
    const formData = new FormData();
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.slug !== undefined) formData.append('slug', data.slug);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.website !== undefined) formData.append('website', data.website);
    if (data.city !== undefined) formData.append('city', data.city);
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId);
    if (data.logoFile) formData.append('logo', data.logoFile);
    if (data.removeLogo) formData.append('removeLogo', 'true');

    const response = await fetch(`${API_URL}/admin/companies/proposals/${proposalId}/approve`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const error = new Error(errorData.error || `API error: ${response.status}`) as any;
      error.status = response.status;
      error.errorCode = errorData.error;
      throw error;
    }

    return await response.json();
  }
  
  return fetchAPIAuth<{ success: boolean; company: { id: string; name: string; slug: string } }>(
    `/admin/companies/proposals/${proposalId}/approve`,
    {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }
  );
}

export async function rejectCompanyProposal(proposalId: string) {
  return fetchAPIAuth<{ success: boolean }>(`/admin/companies/proposals/${proposalId}/reject`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function getAdminCompanies(params?: {
  search?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const query = searchParams.toString();
  const res = await fetchAPIAuth<{
    companies: Array<{
      id: string;
      name: string;
      slug: string;
      city: string;
      rating: number;
      reviewCount: number;
      logoUrl: string | null;
      createdAt: string;
      category: {
        id: string;
        name: string;
      };
    }>;
    total: number;
  }>(`/admin/companies${query ? `?${query}` : ''}`);
  return res;
}

export async function getAdminCompany(companyId: string) {
  return fetchAPIAuth<{
    id: string;
    name: string;
    slug: string;
    description: string;
    city: string;
    logoUrl: string | null;
    categoryId: string;
    rating: number;
    reviewCount: number;
    createdAt: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>(`/admin/companies/${companyId}`);
}

export async function createAdminCompany(data: {
  name: string;
  slug: string;
  description?: string;
  city?: string;
  categoryId: string;
  logo?: File;
}) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('slug', data.slug);
  formData.append('categoryId', data.categoryId);
  if (data.description) formData.append('description', data.description);
  if (data.city) formData.append('city', data.city);
  if (data.logo) {
    formData.append('logo', data.logo);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/admin/companies`, {
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
      throw new Error('Час очікування вичерпано. Спробуйте ще раз.');
    }
    if (error.message === 'fetch failed' || error.code === 'ECONNREFUSED' || error.name === 'TypeError') {
      throw new Error(`Не вдалося підключитися до сервера. Перевірте, чи запущений backend на ${API_URL}`);
    }
    throw error;
  }
}

export async function deleteAdminCompany(companyId: string) {
  return fetchAPIAuth<{ success: boolean; slug: string }>(`/admin/companies/${companyId}`, {
    method: 'DELETE',
  });
}

export async function updateAdminCompany(companyId: string, data: {
  name?: string;
  slug?: string;
  description?: string;
  city?: string;
  categoryId?: string;
  logo?: File;
}) {
  const formData = new FormData();
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.slug !== undefined) formData.append('slug', data.slug);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.city !== undefined) formData.append('city', data.city);
  if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId);
  if (data.logo) {
    formData.append('logo', data.logo);
  }

  try {
    const response = await fetch(`${API_URL}/admin/companies/${companyId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `API error: ${response.status}` };
      }
      const error = new Error(errorData.error || `API error: ${response.status}`) as any;
      error.status = response.status;
      error.errorCode = errorData.error;
      throw error;
    }

    return await response.json() as {
      success: boolean;
      company: {
        id: string;
        name: string;
        slug: string;
        description: string;
        city: string;
        logoUrl: string | null;
        categoryId: string;
        rating: number;
        reviewCount: number;
        createdAt: string;
        category: {
          id: string;
          name: string;
          slug: string;
        };
      };
      oldSlug?: string;
    };
  } catch (error: any) {
    if (error.message === 'fetch failed' || error.code === 'ECONNREFUSED' || error.name === 'TypeError') {
      const connectionError = new Error(`Не вдалося підключитися до сервера. Перевірте, чи запущений backend на ${API_URL}`) as any;
      connectionError.status = 0;
      connectionError.errorCode = 'CONNECTION_ERROR';
      throw connectionError;
    }
    throw error;
  }
}
