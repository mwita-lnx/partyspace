import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://partyspace.tamashani.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/bet-awards/*/vote',
          '/bet-awards/*/settings',
          '/bet-awards/*/receipt',
          '/bet-awards/*/results',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
