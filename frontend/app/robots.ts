import { MetadataRoute } from 'next';

import { BASE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/super-admin',
          '/profile',
          '/review/add',
          '/company/add',
          '/api',
          '/search?*', // Allow search page but disallow query params
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/super-admin',
          '/profile',
          '/review/add',
          '/company/add',
          '/api',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
