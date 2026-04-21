import Link from 'next/link';
import { Suspense } from 'react';
import { Search, BookOpen, ArrowRight, CheckCircle2, Shield, Zap, Newspaper, Calendar, Sparkles, Grid3x3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import DefterMesajCard from '@/components/DefterMesajCard';
import FirmaCard from '@/components/FirmaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrichFirmalarWithStats } from '@/lib/supabase/firma-helpers';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: seo } = await supabase.from('page_seo').select('*').eq('sayfa_key', 'anasayfa').single();
  const { data: settings } = await supabase.from('site_settings').select('seo_title, seo_description, og_image').eq('id', 1).single();

  const title = seo?.title || settings?.seo_title || 'Nakliyat Firma Rehberi - Onaylı Firmalar';
  const description = seo?.description || settings?.seo_description || 'Türkiye geneli onaylı nakliyat firmaları, yük ve boş araç ilanları.';
  const ogImage = seo?.og_image || settings?.og_image || undefined;

  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    alternates: seo?.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      type: 'website',
    },
  };
}

async function DefterFeed() {
  const supabase = createAdminClient();
  const { data: mesajlar } = await supabase
    .from('defter_mesajlari')
    .select(`
      *,
      firmalar:firma_id (id, firma_adi, slug, telefon, durum, created_at),
      nereden:nereden_il_id (ad, slug),
      nereye:nereye_il_id (ad, slug)
    `)
    .eq('aktif', true)
    .eq('silindi', false)
    .eq('onay_durum', 'onayli')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!mesajlar || mesajlar.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Henüz defter mesajı yok.</p>
        <Link href="/kayit" className="inline-block mt-4 text-primary-600 font-semibold hover:underline">
          Firma kaydı oluştur →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mesajlar.map((m: any) => (
        <DefterMesajCard key={m.id} mesaj={m} />
      ))}
    </div>
  );
}

async function PremiumFirmalar() {
  const supabase = createAdminClient();
  const { data: firmalar } = await supabase
    .from('firmalar')
    .select(`*, iller:il_id (ad, slug), kategoriler:kategori_id (ad, slug), ilceler:ilce_id (ad, slug)`)
    .eq('ana_sayfa_premium', true)
    .eq('durum', 'onayli')
    .order('sira', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3);

  if (!firmalar || firmalar.length === 0) return null;

  const firmalarZengin = await enrichFirmalarWithStats(firmalar);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-bold text-xl text-gray-900 flex items-center gap-2">
          <Sparkles size={20} className="text-amber-500" /> Öne Çıkan Firmalar
        </h2>
        <Link href="/firmalar" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
          Tümü <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {firmalarZengin.map((firma: any, i) => (
          <FirmaCard key={firma.id} firma={firma} sira={i + 1} />
        ))}
      </div>
    </section>
  );
}

async function PopulerIller() {
  const supabase = createAdminClient();
  const [{ data: iller }, { data: kategoriler }] = await Promise.all([
    supabase
      .from('iller')
      .select('ad, slug, plaka')
      .eq('aktif', true)
      .order('sira', { ascending: true })
      .limit(24),
    supabase
      .from('kategoriler')
      .select('ad, slug, ikon')
      .eq('aktif', true)
      .order('sira', { ascending: true }),
  ]);

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
          <Search size={20} className="text-primary-500" /> İllere Göre Nakliyat Firmaları
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {iller?.map((il) => (
            <Link
              key={il.slug}
              href={`/firmalar/${il.slug}`}
              className="text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md border border-gray-100"
            >
              {il.ad}
            </Link>
          ))}
        </div>
        <Link href="/firmalar" className="inline-flex items-center gap-1 mt-4 text-primary-600 font-semibold text-sm hover:underline">
          Tüm illeri gör <ArrowRight size={14} />
        </Link>
      </div>

      {kategoriler && kategoriler.length > 0 && (
        <div className="pt-6 border-t border-gray-100">
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Grid3x3 size={20} className="text-primary-500" /> Hizmet Kategorileri
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {kategoriler.map((k: any) => (
              <Link
                key={k.slug}
                href={`/kategori/${k.slug}`}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2.5 rounded-md border border-gray-100 flex items-center gap-2"
              >
                <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {k.ad.charAt(0)}
                </span>
                <span className="truncate">{k.ad}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

async function BlogSection() {
  const supabase = createAdminClient();
  const { data: yazilar } = await supabase
    .from('blog_yazilar')
    .select('id, baslik, slug, ozet, kapak_url, kategori, created_at')
    .eq('yayinda', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!yazilar || yazilar.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-bold text-xl text-gray-900 flex items-center gap-2">
          <Newspaper size={20} className="text-primary-500" /> Blog'dan Son Yazılar
        </h2>
        <Link href="/blog" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
          Tümü <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {yazilar.map((y: any) => (
          <Link key={y.id} href={`/blog/${y.slug}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition group">
            {y.kapak_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={y.kapak_url} alt={y.baslik} className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-primary-300 to-accent-400" />
            )}
            <div className="p-3">
              {y.kategori && (
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wide">
                  {y.kategori}
                </span>
              )}
              <h3 className="font-heading font-bold text-sm text-gray-900 mt-1 line-clamp-2 group-hover:text-primary-600">
                {y.baslik}
              </h3>
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Calendar size={11} /> {new Date(y.created_at).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('hero_aktif, hero_baslik, hero_alt_yazi, hero_btn1_yazi, hero_btn1_link, hero_btn2_yazi, hero_btn2_link, hero_ozellik1, hero_ozellik2, hero_ozellik3')
    .eq('id', 1)
    .single();

  // TypeScript hatasını önlemek için 'as any' ekledik
  const hero = (settings as any) || {};
  const heroAktif = hero.hero_aktif ?? true;

  return (
    <>
      <Header />

      {/* HERO - admin panelden düzenlenebilir */}
      {heroAktif && (
        <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            {hero.hero_baslik && (
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 leading-tight">
                {hero.hero_baslik}
              </h1>
            )}
            {hero.hero_alt_yazi && (
              <p className="text-primary-50 text-sm sm:text-lg mb-5 sm:mb-6 max-w-2xl mx-auto">
                {hero.hero_alt_yazi}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {hero.hero_btn1_yazi && (
                <Link href={hero.hero_btn1_link || '/'} className="bg-white text-primary-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:shadow-lg">
                  {hero.hero_btn1_yazi}
                </Link>
              )}
              {hero.hero_btn2_yazi && (
                <Link href={hero.hero_btn2_link || '/'} className="bg-white/10 backdrop-blur border-2 border-white text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-white/20">
                  {hero.hero_btn2_yazi}
                </Link>
              )}
            </div>
            {(hero.hero_ozellik1 || hero.hero_ozellik2 || hero.hero_ozellik3) && (
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm">
                {hero.hero_ozellik1 && (
                  <div className="flex items-center gap-1.5 sm:gap-2"><Shield size={16} /> {hero.hero_ozellik1}</div>
                )}
                {hero.hero_ozellik2 && (
                  <div className="flex items-center gap-1.5 sm:gap-2"><Zap size={16} /> {hero.hero_ozellik2}</div>
                )}
                {hero.hero_ozellik3 && (
                  <div className="flex items-center gap-1.5 sm:gap-2"><CheckCircle2 size={16} /> {hero.hero_ozellik3}</div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* MAIN GRID */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* LEFT: Defter feed + iller */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-bold text-xl text-gray-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-primary-500" /> Son Defter Mesajları
                </h2>
                <Link href="/defter" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
                  Tümünü Gör <ArrowRight size={14} />
                </Link>
              </div>
              <Suspense fallback={<div className="p-6 text-center text-gray-400">Yükleniyor...</div>}>
                <DefterFeed />
              </Suspense>
            </div>

            <Suspense fallback={null}>
              <PremiumFirmalar />
            </Suspense>

            <Suspense fallback={null}>
              <PopulerIller />
            </Suspense>

            <Suspense fallback={null}>
              <BlogSection />
            </Suspense>
          </div>

          {/* RIGHT: Sidebar reklamlar */}
          <Suspense fallback={null}>
            <ReklamSidebar sayfa="anasayfa" />
          </Suspense>
        </div>
      </main>

      <Footer />
    </>
  );
}
