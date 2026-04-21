import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Grid3x3, MapPin, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import FirmaCard from '@/components/FirmaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrichFirmalarWithStats } from '@/lib/supabase/firma-helpers';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: kat } = await supabase.from('kategoriler').select('*').eq('slug', params.slug).single();
  if (!kat) return { title: 'Bulunamadı' };
  return {
    title: kat.seo_title || `${kat.ad} Firmaları - Türkiye Geneli`,
    description: kat.seo_description || `Türkiye genelinde ${kat.ad} hizmeti veren onaylı firmalar.`,
    alternates: { canonical: `/kategori/${kat.slug}` },
  };
}

export default async function KategoriPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();

  const { data: kategori } = await supabase.from('kategoriler').select('*').eq('slug', params.slug).single();
  if (!kategori) notFound();

  const { data: firmalar } = await supabase
    .from('firmalar')
    .select(`*, iller:il_id (ad, slug), kategoriler:kategori_id (ad, slug)`)
    .eq('kategori_id', kategori.id)
    .eq('durum', 'onayli')
    .order('sira', { ascending: false })
    .order('one_cikan', { ascending: false })
    .order('created_at', { ascending: false });

  // İl bazlı gruplama için sayılar
  const { data: iller } = await supabase
    .from('iller')
    .select('id, ad, slug')
    .eq('aktif', true)
    .order('ad');

  // Hangi illerde bu kategoride firma var?
  const ilFirmaSayisi: Record<number, number> = {};
  firmalar?.forEach((f: any) => {
    if (f.il_id) ilFirmaSayisi[f.il_id] = (ilFirmaSayisi[f.il_id] || 0) + 1;
  });

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
          <span className="font-semibold text-gray-900">{kategori.ad}</span>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
              <Grid3x3 size={28} />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">
                {kategori.ad} Firmaları
              </h1>
              <p className="text-primary-50 text-sm mt-1">
                Türkiye geneli • {firmalar?.length || 0} onaylı firma
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* İllere göre kırılım */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary-500" /> İllere Göre {kategori.ad}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {iller?.map((il) => {
                  const sayi = ilFirmaSayisi[il.id] || 0;
                  return (
                    <Link
                      key={il.id}
                      href={`/firmalar/${il.slug}/${kategori.slug}`}
                      className={`text-sm px-3 py-2 rounded-md border flex items-center justify-between ${
                        sayi > 0
                          ? 'bg-white text-gray-700 border-gray-200 hover:bg-primary-50 hover:border-primary-300'
                          : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}
                    >
                      <span>{il.ad}</span>
                      {sayi > 0 && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-semibold">
                          {sayi}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Öne çıkan firmalar */}
            {firmalarZengin && firmalarZengin.length > 0 ? (
              <section>
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 size={18} className="text-primary-500" /> Öne Çıkan {kategori.ad} Firmaları
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {firmalarZengin.slice(0, 20).map((firma: any, i) => (
                    <FirmaCard key={firma.id} firma={firma} sira={i + 1} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Henüz firma yok</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {kategori.ad} kategorisinde henüz onaylı firma bulunmuyor. Firmanızı kaydedin, ilk siz olun!
                </p>
                <Link href="/kayit" className="inline-block bg-primary-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-600">
                  Firmanızı Kaydedin
                </Link>
              </div>
            )}
          </div>

          <ReklamSidebar sayfa={`kategori:${kategori.slug}`} />
        </div>
      </main>

      <Footer />
    </>
  );
}
