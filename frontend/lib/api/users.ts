import { fetchAPIAuth, API_URL } from './common';

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch(`${API_URL}/users/avatar`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      headers: {},
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || `API error: ${response.status}` };
      }
      throw new Error(error.error || `API error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Invalid response format');
      }
    }
  } catch (error: any) {
    if (error.message === 'fetch failed' || error.code === 'ECONNREFUSED' || error.name === 'TypeError') {
      throw new Error(`Не вдалося підключитися до сервера. Перевірте, чи запущений backend на ${API_URL}`);
    }
    throw error;
  }
}

export async function getTopUsers() {
  return fetchAPIAuth<Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    isAdmin: boolean;
    reviewsCount: number;
    approvedReviewsCount: number;
    reportsCount: number;
    lastActivityAt: string;
  }>>('/admin/users/top');
}

export async function getUserDetails(userId: string) {
  return fetchAPIAuth<{
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
    avatarUrl: string | null;
    stats: {
      totalReviews: number;
      approved: number;
      rejected: number;
      pending: number;
      likesReceived: number;
      dislikesReceived: number;
      reportsSent: number;
      reportsReceived: number;
    };
    recentReviews: Array<{
      id: string;
      rating: number;
      text: string;
      status: string;
      createdAt: string;
      company: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  }>(`/admin/users/${userId}`);
}
