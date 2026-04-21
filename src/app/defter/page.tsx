import Link from 'next/link';
import { BookOpen, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import DefterMesajCard from '@/components/DefterMesajCard';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export const revalidate = 30;
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: seo } = await supabase.from('page_seo').select('*').eq('sayfa_key', 'defter').single();
  return {
    title: seo?.title || 'Nakliyat Defteri - Yük ve Boş Araç İlanları',
    description: seo?.description || 'Anlık yük ilanları ve boş araç ilanları.',
    keywords: seo?.keywords || undefined,
    alternates: seo?.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: seo?.og_image ? { title: seo?.title || 'Defter', description: seo?.description || '', images: [seo.og_image] } : undefined,
  };
}

export default async function DefterPage({
  searchParams,
}: {
  searchParams: { tip?: string; sayfa?: string };
}) {
  const supabase = createAdminClient();
  const sayfa = Math.max(1, parseInt(searchParams.sayfa || '1', 10));
  const limit = 30;
  const from = (sayfa - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('defter_mesajlari')
    .select(
      `*, firmalar:firma_id (id, firma_adi, slug, telefon, durum, created_at),
       nereden:nereden_il_id (ad, slug),
       nereye:nereye_il_id (ad, slug)`,
      { count: 'exact' }
    )
    .eq('aktif', true)
    .eq('silindi', false)
    .eq('onay_durum', 'onayli');

  if (searchParams.tip && ['yuk', 'bos_arac', 'duyuru'].includes(searchParams.tip)) {
    query = query.eq('tip', searchParams.tip);
  }

  const { data: mesajlar, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  const toplamSayfa = Math.ceil((count || 0) / limit);

  const filterLinks = [
    { tip: '', label: 'Tümü' },
    { tip: 'yuk', label: 'Yük/İş' },
    { tip: 'bos_arac', label: 'Boş Araç' },
    { tip: 'duyuru', label: 'Duyuru' },
  ];

  return (
    <>
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 flex items-center gap-2">
            <BookOpen className="text-primary-500" /> Nakliyat Defteri
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Onaylı firmalardan anlık yük ve boş araç ilanları. Toplam <strong>{count || 0}</strong> kayıt.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Filter size={14} /> Filtrele:
              </span>
              {filterLinks.map((f) => {
                const aktif = (searchParams.tip || '') === f.tip;
                return (
                  <Link
                    key={f.tip || 'all'}
                    href={`/defter${f.tip ? `?tip=${f.tip}` : ''}`}
                    className={`text-sm px-3 py-1.5 rounded-md border ${
                      aktif
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>

            {mesajlar && mesajlar.length > 0 ? (
              <div className="space-y-3">
                {mesajlar.map((m: any) => (
                  <DefterMesajCard key={m.id} mesaj={m} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Kayıt bulunamadı.</p>
              </div>
            )}

            {/* Pagination */}
            {toplamSayfa > 1 && (
              <div className="flex justify-center gap-1 mt-6">
                {Array.from({ length: toplamSayfa }).slice(0, 10).map((_, i) => {
                  const p = i + 1;
                  const aktif = p === sayfa;
                  const qs = new URLSearchParams();
                  if (searchParams.tip) qs.set('tip', searchParams.tip);
                  if (p > 1) qs.set('sayfa', String(p));
                  const href = `/defter${qs.toString() ? `?${qs.toString()}` : ''}`;
                  return (
                    <Link
                      key={p}
                      href={href}
                      className={`px-3 py-2 rounded-md text-sm font-semibold ${
                        aktif ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <ReklamSidebar sayfa="defter" />
        </div>
      </main>

      <Footer />
    </>
  );
}
