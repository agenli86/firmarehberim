import Link from 'next/link';
import { MapPin, Grid3x3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Nakliyat Firmaları - Türkiye Genelinde Onaylı Firmalar',
  description: 'Türkiye geneli 81 ilde onaylı nakliyat firmaları.',
};

export default async function FirmalarIndexPage() {
  const supabase = createAdminClient();
  const { data: iller } = await supabase
    .from('iller')
    .select('id, ad, slug, plaka')
    .eq('aktif', true)
    .order('plaka', { ascending: true });

  const { data: kategoriler } = await supabase
    .from('kategoriler')
    .select('id, ad, slug, ikon')
    .eq('aktif', true)
    .order('sira', { ascending: true });

  const { count: firmaSayisi } = await supabase
    .from('firmalar')
    .select('*', { count: 'exact', head: true })
    .eq('durum', 'onayli');

  return (
    <>
      <Header />

      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl">Nakliyat Firmaları</h1>
          <p className="text-primary-50 mt-2">
            {firmaSayisi || 0} onaylı firma • 81 ilde hizmet
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Kategoriler */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Grid3x3 size={20} className="text-primary-500" /> Kategoriler
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {kategoriler?.map((k) => (
                  <Link
                    key={k.id}
                    href={`/kategori/${k.slug}`}
                    className="text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2.5 rounded-md border border-gray-200 font-medium"
                  >
                    {k.ad}
                  </Link>
                ))}
              </div>
            </section>

            {/* İller grid */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-primary-500" /> İller
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {iller?.map((il) => (
                  <Link
                    key={il.id}
                    href={`/firmalar/${il.slug}`}
                    className="group flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2.5 rounded-md border border-gray-100"
                  >
                    <span className="text-[10px] font-mono bg-gray-100 group-hover:bg-primary-100 px-1.5 py-0.5 rounded">
                      {String(il.plaka).padStart(2, '0')}
                    </span>
                    <span className="truncate">{il.ad}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <ReklamSidebar sayfa="firmalar" />
        </div>
      </main>

      <Footer />
    </>
  );
}
