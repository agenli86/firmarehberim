import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  const [
    { data: iller },
    { data: kategoriler },
    { data: ilceler },
    { data: firmalar },
    { data: sabitSayfalar },
    { data: blogYazilar },
  ] = await Promise.all([
    supabase.from('iller').select('slug').eq('aktif', true),
    supabase.from('kategoriler').select('slug').eq('aktif', true),
    supabase.from('ilceler').select('slug, iller:il_id(slug)').eq('aktif', true),
    supabase.from('firmalar').select('slug, updated_at').eq('durum', 'onayli'),
    supabase.from('sabit_sayfalar').select('slug').eq('aktif', true),
    supabase.from('blog_yazilar').select('slug, updated_at').eq('yayinda', true),
  ]);

  // Sitemap'e sadece SEO değeri olan sayfaları koyuyoruz
  // /kayit, /giris, /admin, /panel, /api → fonksiyon sayfaları, robots.txt'de Disallow
  const staticUrls = [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    { url: `${SITE_URL}/defter`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/firmalar`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/teklif-al`, lastModified: new Date(), priority: 0.8 },
  ];

  const sabitUrls = (sabitSayfalar || []).map((s) => ({
    url: `${SITE_URL}/${s.slug}`,
    lastModified: new Date(),
    priority: 0.6,
  }));

  const ilUrls = (iller || []).map((il) => ({
    url: `${SITE_URL}/firmalar/${il.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  const kategoriUrls = (kategoriler || []).map((k) => ({
    url: `${SITE_URL}/kategori/${k.slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  // İl + Kategori kombinasyonları
  const ilKategoriUrls: any[] = [];
  for (const il of iller || []) {
    for (const kat of kategoriler || []) {
      ilKategoriUrls.push({
        url: `${SITE_URL}/firmalar/${il.slug}/${kat.slug}`,
        lastModified: new Date(),
        priority: 0.7,
      });
    }
  }

  // İlçe URL'leri: /firmalar/il/ilce
  const ilceUrls = (ilceler || []).map((ilc: any) => ({
    url: `${SITE_URL}/firmalar/${ilc.iller?.slug}/${ilc.slug}`,
    lastModified: new Date(),
    priority: 0.6,
  }));

  const firmaUrls = (firmalar || []).map((f) => ({
    url: `${SITE_URL}/firma/${f.slug}`,
    lastModified: new Date(f.updated_at),
    priority: 0.6,
  }));

  const blogUrls = (blogYazilar || []).map((y: any) => ({
    url: `${SITE_URL}/blog/${y.slug}`,
    lastModified: new Date(y.updated_at),
    priority: 0.6,
  }));

  const blogIndex = [{ url: `${SITE_URL}/blog`, lastModified: new Date(), priority: 0.7 }];

  return [
    ...staticUrls,
    ...sabitUrls,
    ...blogIndex,
    ...blogUrls,
    ...ilUrls,
    ...kategoriUrls,
    ...ilceUrls,
    ...ilKategoriUrls,
    ...firmaUrls,
  ];
}
