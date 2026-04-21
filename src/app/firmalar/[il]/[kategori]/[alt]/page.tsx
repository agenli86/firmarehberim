import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, MapPin, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import FirmaCard from '@/components/FirmaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrichFirmalarWithStats } from '@/lib/supabase/firma-helpers';
import type { Metadata } from 'next';

export const revalidate = 300;

// Helper: bir slug'ın ilçe mi kategori mi olduğunu çöz
async function resolveSegment(ilId: number, slug: string) {
  const supabase = createAdminClient();
  const { data: ilce } = await supabase.from('ilceler').select('*').eq('il_id', ilId).eq('slug', slug).eq('aktif', true).single();
  if (ilce) return { tip: 'ilce' as const, data: ilce };

  const { data: kategori } = await supabase.from('kategoriler').select('*').eq('slug', slug).eq('aktif', true).single();
  if (kategori) return { tip: 'kategori' as const, data: kategori };

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { il: string; kategori: string; alt: string };
}): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: il } = await supabase.from('iller').select('*').eq('slug', params.il).single();
  if (!il) return { title: 'Bulunamadı' };

  const r1 = await resolveSegment(il.id, params.kategori);
  const r2 = await resolveSegment(il.id, params.alt);
  if (!r1 || !r2) return { title: 'Bulunamadı' };

  // Birisi ilçe birisi kategori olmalı
  const ilce = r1.tip === 'ilce' ? r1.data : r2.tip === 'ilce' ? r2.data : null;
  const kat = r1.tip === 'kategori' ? r1.data : r2.tip === 'kategori' ? r2.data : null;
  if (!ilce || !kat) return { title: 'Bulunamadı' };

  return {
    title: `${il.ad} ${ilce.ad} ${kat.ad} Firmaları`,
    description: `${il.ad} ${ilce.ad} ilçesinde ${kat.ad} hizmeti veren onaylı firmalar.`,
    alternates: { canonical: `/firmalar/${params.il}/${ilce.slug}/${kat.slug}` },
  };
}

export default async function IlIlceKategoriPage({
  params,
}: {
  params: { il: string; kategori: string; alt: string };
}) {
  const supabase = createAdminClient();

  const { data: il } = await supabase.from('iller').select('*').eq('slug', params.il).single();
  if (!il) notFound();

  const r1 = await resolveSegment(il.id, params.kategori);
  const r2 = await resolveSegment(il.id, params.alt);
  if (!r1 || !r2) notFound();

  // İki segment'ten birisi ilçe, diğeri kategori olmalı
  const ilce = r1.tip === 'ilce' ? r1.data : r2.tip === 'ilce' ? r2.data : null;
  const kategori = r1.tip === 'kategori' ? r1.data : r2.tip === 'kategori' ? r2.data : null;
  if (!ilce || !kategori) notFound();

  const { data: firmalar } = await supabase
    .from('firmalar')
    .select(`*, iller:il_id (ad, slug), kategoriler:kategori_id (ad, slug), ilceler:ilce_id (ad, slug)`)
    .eq('il_id', il.id)
    .eq('ilce_id', ilce.id)
    .eq('kategori_id', kategori.id)
    .eq('durum', 'onayli')
    .order('sira', { ascending: false })
    .order('one_cikan', { ascending: false })
    .order('created_at', { ascending: false });

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
          <Link href={`/firmalar/${il.slug}/${ilce.slug}`} className="hover:text-primary-600">{ilce.ad}</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-900">{kategori.ad}</span>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl flex items-center gap-2">
            <MapPin size={28} /> {il.ad} {ilce.ad} {kategori.ad} Firmaları
          </h1>
          <p className="text-primary-50 text-sm mt-1">
            {firmalar?.length || 0} onaylı firma listelendi
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            {firmalarZengin && firmalarZengin.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {firmalarZengin.map((firma: any, i) => (
                  <FirmaCard key={firma.id} firma={firma} sira={i + 1} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Firma Bulunamadı</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {il.ad} {ilce.ad} ilçesinde {kategori.ad} kategorisinde henüz onaylı firma yok.
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Link href={`/firmalar/${il.slug}/${ilce.slug}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-50">
                    {ilce.ad} Tüm Firmalar
                  </Link>
                  <Link href={`/firmalar/${il.slug}/${kategori.slug}`} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-50">
                    {il.ad} {kategori.ad}
                  </Link>
                  <Link href="/kayit" className="bg-primary-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-600">
                    Firma Kaydı
                  </Link>
                </div>
              </div>
            )}
          </div>

          <ReklamSidebar sayfa={`ilce:${ilce.slug}`} />
        </div>
      </main>

      <Footer />
    </>
  );
}
