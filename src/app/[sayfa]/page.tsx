import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import IletisimForm from '@/components/IletisimForm';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export const revalidate = 600;

// Hangi sayfalar statik — yoksa 404 yerine generate
export async function generateStaticParams() {
  return [
    { sayfa: 'hakkimizda' },
    { sayfa: 'kvkk' },
    { sayfa: 'sozlesme' },
    { sayfa: 'iletisim' },
  ];
}

export async function generateMetadata({ params }: { params: { sayfa: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data } = await supabase.from('sabit_sayfalar').select('*').eq('slug', params.sayfa).single();
  if (!data) return { title: 'Bulunamadı' };
  return {
    title: data.seo_title || data.baslik,
    description: data.seo_description || undefined,
    alternates: { canonical: `/${params.sayfa}` },
  };
}

export default async function SabitSayfaPage({ params }: { params: { sayfa: string } }) {
  const supabase = createAdminClient();
  const { data: sayfa } = await supabase
    .from('sabit_sayfalar')
    .select('*')
    .eq('slug', params.sayfa)
    .eq('aktif', true)
    .single();

  if (!sayfa) notFound();

  // Site ayarlarını çek (iletişim sayfası için)
  const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 1).single();

  return (
    <>
      <Header />

      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="font-heading font-extrabold text-3xl">{sayfa.baslik}</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
            {sayfa.icerik && (
              <div className="prose" dangerouslySetInnerHTML={{ __html: sayfa.icerik }} />
            )}

            {/* İletişim sayfasında form göster */}
            {params.sayfa === 'iletisim' && (
              <>
                <div className="mt-8 pt-8 border-t border-gray-200">
                  {settings && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      {settings.telefon && (
                        <a href={`tel:${settings.telefon}`} className="p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100">
                          <div className="text-xs text-gray-500 mb-1">Telefon</div>
                          <div className="font-semibold text-primary-700">{settings.telefon}</div>
                        </a>
                      )}
                      {settings.email && (
                        <a href={`mailto:${settings.email}`} className="p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100">
                          <div className="text-xs text-gray-500 mb-1">E-posta</div>
                          <div className="font-semibold text-primary-700 text-sm">{settings.email}</div>
                        </a>
                      )}
                      {settings.adres && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Adres</div>
                          <div className="font-semibold text-gray-700 text-sm">{settings.adres}</div>
                        </div>
                      )}
                    </div>
                  )}
                  <IletisimForm />
                </div>
              </>
            )}
          </div>

          <ReklamSidebar sayfa={`sabit:${params.sayfa}`} />
        </div>
      </main>

      <Footer />
    </>
  );
}
