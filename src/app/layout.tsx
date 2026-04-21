import type { Metadata } from 'next';
import './globals.css';
import { createAdminClient } from '@/lib/supabase/admin';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  return {
    title: {
      default: settings?.seo_title || 'Nakliyat Firma Rehberi',
      // template kaldırıldı - her sayfa kendi başlığını kullanacak, site adı otomatik eklenmeyecek
    },
    description: settings?.seo_description || 'Türkiye geneli onaylı nakliyat firmaları',
    keywords: settings?.seo_keywords || 'nakliyat, evden eve, yük, boş araç',
    icons: settings?.favicon_url ? { icon: settings.favicon_url } : undefined,
    openGraph: {
      type: 'website',
      siteName: settings?.site_adi || 'Nakliyat Rehberi',
      images: settings?.og_image ? [settings.og_image] : undefined,
    },
    verification: {
      google: settings?.google_verification || undefined,
      yandex: settings?.yandex_verification || undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from('site_settings').select('google_analytics').eq('id', 1).single();
  const gaId = settings?.google_analytics;

  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {gaId && (
          <>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="font-body bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
