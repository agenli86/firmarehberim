import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import FirmaCard from '@/components/FirmaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrichFirmalarWithStats } from '@/lib/supabase/firma-helpers';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { il: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: il } = await supabase.from('iller').select('*').eq('slug', params.il).single();
  if (!il) return { title: 'Bulunamadı' };
  return {
    title: il.seo_title || `${il.ad} Nakliyat Firmaları - Onaylı Firma Rehberi`,
    description: il.seo_description || `${il.ad} ilinde hizmet veren onaylı nakliyat firmaları.`,
  };
}

export default async function IlFirmalariPage({ params }: { params: { il: string } }) {
  const supabase = createAdminClient();

  const { data: il } = await supabase.from('iller').select('*').eq('slug', params.il).single();
  if (!il) notFound();

  const { data: firmalar } = await supabase
    .from('firmalar')
    .select(`*, iller:il_id (ad, slug), kategoriler:kategori_id (ad, slug)`)
    .eq('il_id', il.id)
    .eq('durum', 'onayli')
    .order('sira', { ascending: false })
    .order('one_cikan', { ascending: false })
    .order('created_at', { ascending: false });

  const { data: kategoriler } = await supabase
    .from('kategoriler')
    .select('id, ad, slug')
    .eq('aktif', true)
    .order('sira', { ascending: true });

  const { data: ilceler } = await supabase
    .from('ilceler')
    .select('id, ad, slug')
    .eq('il_id', il.id)
    .eq('aktif', true)
    .order('sira', { ascending: true });

  // Yorum istatistiklerini ekle
  const firmalarZengin = await enrichFirmalarWithStats(firmalar || []);

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-xs text-gray-600">
          <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <Link href="/firmalar" className="hover:text-primary-600">Firmalar</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-900">{il.ad}</span>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
              <MapPin size={28} />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">
                {il.ad} Nakliyat Firmaları
              </h1>
              <p className="text-primary-50 text-sm mt-1">
                {firmalar?.length || 0} onaylı firma listelendi
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            {/* İlçe listesi */}
            {ilceler && ilceler.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  {il.ad} İlçeleri:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {ilceler.map((ilc) => (
                    <Link
                      key={ilc.id}
                      href={`/firmalar/${il.slug}/${ilc.slug}`}
                      className="text-sm px-3 py-1.5 rounded-md border bg-white text-gray-700 border-gray-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
                    >
                      {ilc.ad}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Kategori filtreleri */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Kategoriler:</span>
              {kategoriler?.map((k) => (
                <Link
                  key={k.id}
                  href={`/firmalar/${il.slug}/${k.slug}`}
                  className="text-sm px-3 py-1.5 rounded-md border bg-white text-gray-700 border-gray-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
                >
                  {k.ad}
                </Link>
              ))}
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
                <h3 className="font-semibold text-gray-700 mb-2">Henüz firma yok</h3>
                <p className="text-sm text-gray-500 mb-4">{il.ad} için henüz onaylı firma bulunmuyor.</p>
                <Link href="/kayit" className="inline-block bg-primary-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-600">
                  Firmanızı Kaydedin
                </Link>
              </div>
            )}

            {il.seo_content && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 prose" dangerouslySetInnerHTML={{ __html: il.seo_content }} />
            )}
          </div>

          <ReklamSidebar sayfa={`il:${il.slug}`} />
        </div>
      </main>

      <Footer />
    </>
  );
}
