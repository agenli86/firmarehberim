import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, MapPin, Building2, Grid3x3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import FirmaCard from '@/components/FirmaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrichFirmalarWithStats } from '@/lib/supabase/firma-helpers';
import type { Metadata } from 'next';

export const revalidate = 300;

// Helper: slug'ın ilçe mi kategori mi olduğunu tespit et
async function resolveSegment(ilId: number, slug: string) {
  const supabase = createAdminClient();
  // Önce ilçe kontrolü (bu ile ait bir ilçe mi?)
  const { data: ilce } = await supabase.from('ilceler').select('*').eq('il_id', ilId).eq('slug', slug).eq('aktif', true).single();
  if (ilce) return { tip: 'ilce' as const, data: ilce };

  // Sonra kategori kontrolü
  const { data: kategori } = await supabase.from('kategoriler').select('*').eq('slug', slug).eq('aktif', true).single();
  if (kategori) return { tip: 'kategori' as const, data: kategori };

  return null;
}

export async function generateMetadata({ params }: { params: { il: string; kategori: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: il } = await supabase.from('iller').select('*').eq('slug', params.il).single();
  if (!il) return { title: 'Bulunamadı' };

  const resolved = await resolveSegment(il.id, params.kategori);
  if (!resolved) return { title: 'Bulunamadı' };

  if (resolved.tip === 'ilce') {
    return {
      title: resolved.data.seo_title || `${il.ad} ${resolved.data.ad} Nakliyat Firmaları`,
      description: resolved.data.seo_description || `${il.ad} ${resolved.data.ad} ilçesinde hizmet veren onaylı nakliyat firmaları.`,
      alternates: { canonical: `/firmalar/${params.il}/${params.kategori}` },
    };
  } else {
    // İl + kategori için özel SEO var mı bak
    const { data: ozelSeo } = await supabase
      .from('il_kategori_seo')
      .select('seo_title, seo_description')
      .eq('il_id', il.id)
      .eq('kategori_id', resolved.data.id)
      .maybeSingle();

    return {
      title: ozelSeo?.seo_title || `${il.ad} ${resolved.data.ad} Firmaları`,
      description: ozelSeo?.seo_description || `${il.ad} ilinde ${resolved.data.ad} hizmeti veren onaylı firmalar.`,
      alternates: { canonical: `/firmalar/${params.il}/${params.kategori}` },
    };
  }
}

export default async function IlKategoriVeyaIlcePage({
  params,
}: {
  params: { il: string; kategori: string };
}) {
  const supabase = createAdminClient();

  const { data: il } = await supabase.from('iller').select('*').eq('slug', params.il).single();
  if (!il) notFound();

  const resolved = await resolveSegment(il.id, params.kategori);
  if (!resolved) notFound();

  // İlçe ise: o ilçedeki tüm firmalar + kategori filtresi için linkler
  if (resolved.tip === 'ilce') {
    const ilce = resolved.data;

    const { data: firmalar } = await supabase
      .from('firmalar')
      .select(`*, iller:il_id (ad, slug), kategoriler:kategori_id (ad, slug), ilceler:ilce_id (ad, slug)`)
      .eq('il_id', il.id)
      .eq('ilce_id', ilce.id)
      .eq('durum', 'onayli')
      .order('sira', { ascending: false })
      .order('one_cikan', { ascending: false })
      .order('created_at', { ascending: false });

    const { data: kategoriler } = await supabase.from('kategoriler').select('*').eq('aktif', true).order('sira');

    const firmalarZengin = await enrichFirmalarWithStats(firmalar || []);

    return (
      <>
        <Header />

        <nav className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
            <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
            <ChevronRight size={12} />
            <Link href="/firmalar" className="hover:text-primary-600">Firmalar</Link>
            <ChevronRight size={12} />
            <Link href={`/firmalar/${il.slug}`} className="hover:text-primary-600">{il.ad}</Link>
            <ChevronRight size={12} />
            <span className="font-semibold text-gray-900">{ilce.ad}</span>
          </div>
        </nav>

        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl flex items-center gap-2">
              <MapPin size={28} /> {il.ad} {ilce.ad} Nakliyat Firmaları
            </h1>
            <p className="text-primary-50 text-sm mt-1">
              {firmalar?.length || 0} onaylı firma listelendi
            </p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              {/* Kategori filtreleri - İlçe+Kategori kombinasyonları */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  {ilce.ad} için kategori seçin:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {kategoriler?.map((k) => (
                    <Link
                      key={k.id}
                      href={`/firmalar/${il.slug}/${ilce.slug}/${k.slug}`}
                      className="text-sm px-3 py-1.5 rounded-md border bg-white text-gray-700 border-gray-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
                    >
                      {k.ad}
                    </Link>
                  ))}
                </div>
              </div>

              {firmalarZengin && firmalarZengin.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {firmalarZengin.map((firma: any, i) => (
                    <FirmaCard key={firma.id} firma={firma} sira={i + 1} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-700 mb-2">Firma Bulunamadı</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {il.ad} {ilce.ad} için henüz onaylı nakliyat firması bulunmuyor.
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Link href={`/firmalar/${il.slug}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-50">
                      {il.ad} Tüm Firmalar
                    </Link>
                    <Link href="/kayit" className="bg-primary-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-600">
                      Firma Kaydı
                    </Link>
                  </div>
                </div>
              )}

              {ilce.seo_content && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 prose" dangerouslySetInnerHTML={{ __html: ilce.seo_content }} />
              )}
            </div>

            <ReklamSidebar sayfa={`ilce:${ilce.slug}`} />
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // Kategori ise: eski davranış (il + kategori firmaları)
  const kategori = resolved.data;

  // İl+Kategori için özel SEO/içerik
  const { data: ozelSeo } = await supabase
    .from('il_kategori_seo')
    .select('h1, icerik')
    .eq('il_id', il.id)
    .eq('kategori_id', kategori.id)
    .maybeSingle();

  const baslik = ozelSeo?.h1 || `${il.ad} ${kategori.ad} Firmaları`;

  const { data: firmalar } = await supabase
    .from('firmalar')
    .select(`*, iller:il_id (ad, slug), kategoriler:kategori_id (ad, slug), ilceler:ilce_id (ad, slug)`)
    .eq('il_id', il.id)
    .eq('kategori_id', kategori.id)
    .eq('durum', 'onayli')
    .order('sira', { ascending: false })
    .order('one_cikan', { ascending: false })
    .order('created_at', { ascending: false });

  const { data: ilceler } = await supabase.from('ilceler').select('id, ad, slug').eq('il_id', il.id).eq('aktif', true).order('sira');

  const firmalarZengin2 = await enrichFirmalarWithStats(firmalar || []);

  return (
    <>
      <Header />

      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
          <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <Link href="/firmalar" className="hover:text-primary-600">Firmalar</Link>
          <ChevronRight size={12} />
          <Link href={`/firmalar/${il.slug}`} className="hover:text-primary-600">{il.ad}</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-900">{kategori.ad}</span>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl flex items-center gap-2">
            <Grid3x3 size={28} /> {baslik}
          </h1>
          <p className="text-primary-50 text-sm mt-1">
            {firmalar?.length || 0} onaylı firma listelendi
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            {/* İlçe filtreleri - İl+Kategori+İlçe kombinasyonları */}
            {ilceler && ilceler.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  {kategori.ad} için ilçe seçin:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {ilceler.map((ilc) => (
                    <Link
                      key={ilc.id}
                      href={`/firmalar/${il.slug}/${ilc.slug}/${kategori.slug}`}
                      className="text-sm px-3 py-1.5 rounded-md border bg-white text-gray-700 border-gray-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
                    >
                      {ilc.ad}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {firmalarZengin2 && firmalarZengin2.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {firmalarZengin2.map((firma: any, i) => (
                  <FirmaCard key={firma.id} firma={firma} sira={i + 1} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Firma Bulunamadı</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {il.ad} ilinde {kategori.ad} kategorisinde henüz onaylı firma bulunmuyor.
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Link href={`/firmalar/${il.slug}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-50">
                    {il.ad} Tüm Firmalar
                  </Link>
                  <Link href={`/kategori/${kategori.slug}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-50">
                    Türkiye {kategori.ad}
                  </Link>
                  <Link href="/kayit" className="bg-primary-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-600">
                    Firma Kaydı
                  </Link>
                </div>
              </div>
            )}

            {/* İl+Kategori için özel içerik (admin panelden girilir) */}
            {ozelSeo?.icerik && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 prose" dangerouslySetInnerHTML={{ __html: ozelSeo.icerik }} />
            )}
          </div>

          <ReklamSidebar sayfa={`il:${il.slug}`} />
        </div>
      </main>

      <Footer />
    </>
  );
}
