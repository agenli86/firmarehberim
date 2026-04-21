import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TeklifForm from './TeklifForm';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evden Eve Nakliyat İçin 4 Firmadan Teklif Al - Ücretsiz',
  description: 'Formu doldurun, 4 onaylı nakliyat firmasından ücretsiz teklif alın. Evden eve, şehirler arası, ofis taşıma — en uygun fiyatı karşılaştırın.',
  keywords: 'evden eve nakliyat teklifi, 4 firma teklif, nakliyat fiyat teklifi, ücretsiz teklif, nakliyat fiyatı',
  alternates: { canonical: '/teklif-al' },
  openGraph: {
    title: 'Evden Eve Nakliyat İçin 4 Firmadan Teklif Al',
    description: 'Formu doldurun, 4 onaylı nakliyat firmasından ücretsiz teklif alın.',
    type: 'website',
  },
};

export default async function TeklifAlPage() {
  const supabase = createAdminClient();
  const [{ data: iller }, { data: kategoriler }] = await Promise.all([
    supabase.from('iller').select('id, ad').eq('aktif', true).order('ad'),
    supabase.from('kategoriler').select('id, ad').eq('aktif', true).order('sira'),
  ]);

  return (
    <>
      <Header />
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl">Ücretsiz Teklif Al</h1>
          <p className="text-primary-50 mt-2">
            Formu doldurun, onaylı nakliyat firmaları sizinle iletişime geçsin
          </p>
        </div>
      </div>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <TeklifForm iller={iller || []} kategoriler={kategoriler || []} />
      </main>
      <Footer />
    </>
  );
}
