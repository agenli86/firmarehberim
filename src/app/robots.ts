import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',      // Admin paneli
          '/panel/',      // Firma paneli
          '/api/',        // API endpoint'leri
          '/kayit',       // Firma kayıt formu (SEO değeri yok)
          '/giris',       // Giriş sayfası
          '/admin/giris', // Admin giriş
          '/*?*',         // Query string'li URL'ler (filtre, pagination)
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
