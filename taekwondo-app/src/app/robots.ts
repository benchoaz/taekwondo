import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/coach/', '/mobile-simulator/'],
    },
    sitemap: 'https://whitetigerkraksaan.com/sitemap.xml',
  };
}
