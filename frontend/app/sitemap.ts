import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/constants';
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';

async function getAllCompanies(): Promise<Array<{ slug: string }>> {
  try {
    const response = await fetch(`${API_URL}/companies?limit=10000`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching companies for sitemap:', error);
    return [];
  }
}

async function getAllCategories(): Promise<Array<{ slug: string }>> {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

async function getAllApprovedReviews() {
  try {
    const response = await fetch(`${API_URL}/reviews/sitemap`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      return [];
    }
    
    const reviews = await response.json();
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, companies, reviews] = await Promise.all([
    getAllCategories(),
    getAllCompanies(),
    getAllApprovedReviews(),
  ]);

  const sitemapEntries: MetadataRoute.Sitemap = [];

  sitemapEntries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  sitemapEntries.push({
    url: `${BASE_URL}/categories`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  sitemapEntries.push({
    url: `${BASE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.3,
  });

  sitemapEntries.push({
    url: `${BASE_URL}/privacy`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.2,
  });

  sitemapEntries.push({
    url: `${BASE_URL}/terms`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.2,
  });

  sitemapEntries.push({
    url: `${BASE_URL}/rules`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.4,
  });

  sitemapEntries.push({
    url: `${BASE_URL}/review/add`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  });

  categories.forEach((category) => {
    sitemapEntries.push({
      url: `${BASE_URL}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  companies.forEach((company) => {
    sitemapEntries.push({
      url: `${BASE_URL}/company/${company.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  reviews.forEach((review: { id: string; createdAt: string }) => {
    sitemapEntries.push({
      url: `${BASE_URL}/review/${review.id}`,
      lastModified: new Date(review.createdAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  return sitemapEntries;
}
