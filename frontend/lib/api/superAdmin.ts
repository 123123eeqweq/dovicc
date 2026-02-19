import { fetchAPIAuth } from './common';

export async function getSuperAdmins() {
  return fetchAPIAuth<Array<{
    id: string;
    email: string;
    name: string;
    createdAt: string;
  }>>('/super-admin/users/superadmins');
}

export async function getAdmins() {
  return fetchAPIAuth<Array<{
    id: string;
    email: string;
    name: string;
    createdAt: string;
  }>>('/super-admin/users/admins');
}

export async function promoteToAdmin(email: string) {
  return fetchAPIAuth<{ success: boolean }>('/super-admin/users/promote', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function demoteFromAdmin(email: string) {
  return fetchAPIAuth<{ success: boolean }>('/super-admin/users/demote', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function getSuperAdminAnalytics(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  return fetchAPIAuth<{
    coreMetrics: {
      totalUsers: number;
      totalCompanies: number;
      totalReviews: number;
      avgRating: number;
      periodChange: {
        users: number;
        companies: number;
        reviews: number;
      };
    };
    activityMetrics: Array<{
      date: string;
      newUsers: number;
      newCompanies: number;
      newReviews: number;
      approved: number;
      rejected: number;
    }>;
    moderationHealth: {
      pendingReviews: number;
      pendingReviewsOld: number;
      pendingCompanies: number;
      pendingReports: number;
      status: 'ok' | 'warning' | 'critical';
    };
    adminPerformance: Array<{
      id: string;
      email: string;
      name: string;
      approveCount: number;
      rejectCount: number;
      createdAt?: string;
    }>;
    contentQuality: {
      topCompaniesByActivity: Array<{
        id: string;
        name: string;
        slug: string;
        reviewCount: number;
        rating: number;
      }>;
      topUsersByActivity: Array<{
        id: string;
        name: string;
        email: string;
        reviewsCount: number;
      }>;
    };
    funnel: {
      users: number;
      reviews: number;
      approved: number;
    };
  }>(`/super-admin/analytics${params.toString() ? `?${params.toString()}` : ''}`);
}
