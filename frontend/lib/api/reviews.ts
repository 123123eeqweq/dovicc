import { fetchAPI, fetchAPIAuth } from './common';

export async function submitReview(companySlug: string, rating: number, text: string, pros?: string, cons?: string, title?: string) {
  return fetchAPIAuth<{
    id: string;
    title: string | null;
    rating: number;
    text: string;
    pros: string | null;
    cons: string | null;
    status: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>('/reviews', {
    method: 'POST',
    body: JSON.stringify({ companySlug, rating, text, title, pros, cons }),
  });
}

export async function getPendingReviews(params?: { limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const query = searchParams.toString();
  return fetchAPIAuth<Array<{
    id: string;
    rating: number;
    text: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
    company: {
      name: string;
      slug: string;
    };
  }>>(`/admin/reviews${query ? `?${query}` : ''}`);
}

export async function approveReview(reviewId: string) {
  return fetchAPIAuth<{ success: boolean; companySlug: string }>(`/admin/reviews/${reviewId}/approve`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function rejectReview(reviewId: string) {
  return fetchAPIAuth<{ success: boolean; companySlug: string }>(`/admin/reviews/${reviewId}/reject`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function reactToReview(reviewId: string, value: 1 | -1) {
  return fetchAPIAuth<{
    success: boolean;
    likesCount: number;
    dislikesCount: number;
    companySlug: string;
  }>(`/reviews/${reviewId}/react`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  });
}

export async function reportReview(reviewId: string, reason: string, comment?: string) {
  return fetchAPIAuth<{ success: boolean }>(`/reviews/${reviewId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason, comment }),
  });
}

export async function getReports(params?: { limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const query = searchParams.toString();
  return fetchAPIAuth<Array<{
    id: string;
    reason: string;
    comment: string | null;
    createdAt: string;
    review: {
      id: string;
      text: string;
      rating: number;
      company: {
        name: string;
        slug: string;
      };
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>>(`/admin/reports${query ? `?${query}` : ''}`);
}

export async function resolveReport(reportId: string, action: 'keep' | 'delete') {
  return fetchAPIAuth<{ success: boolean; companySlug: string; action: string }>(`/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}

export async function getUserReviews() {
  return fetchAPIAuth<Array<{
    id: string;
    title: string | null;
    rating: number;
    text: string;
    pros: string | null;
    cons: string | null;
    status: string;
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
    company: {
      id: string;
      name: string;
      slug: string;
      city: string;
      category: {
        name: string;
      };
    };
  }>>('/reviews/me');
}

export async function deleteReview(reviewId: string) {
  return fetchAPIAuth<{ success: boolean }>(`/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}

export async function getReview(reviewId: string) {
  return fetchAPI<{
    id: string;
    title: string | null;
    rating: number;
    text: string;
    pros: string | null;
    cons: string | null;
    status: string;
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
    userReaction: number | null;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    company: {
      id: string;
      name: string;
      slug: string;
      rating: number;
      reviewCount: number;
      city: string;
      ratingDistribution?: Array<{
        rating: number;
        count: number;
        percentage: number;
      }>;
      category: {
        name: string;
        slug: string;
      };
    };
  }>(`/reviews/${reviewId}`, {
    revalidate: 60,
    tags: [`review:${reviewId}`],
  });
}
