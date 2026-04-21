import Header from '@/components/Header';
import Footer from '@/components/Footer';
import KayitForm from './KayitForm';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Firma Kayıt - Nakliyat Platformu',
  description: 'Nakliyat firmanızı ücretsiz kaydedin. Kimlik ve vergi levhası ile onaylı üye olun.',
  robots: { index: false, follow: false },
};

export default async function KayitPage() {
  const supabase = createAdminClient();
  const { data: iller } = await supabase.from('iller').select('id, ad, slug').eq('aktif', true).order('ad');
  const { data: kategoriler } = await supabase.from('kategoriler').select('id, ad, slug').eq('aktif', true).order('sira');

  return (
    <>
      <Header />
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl">Firma Kaydı</h1>
          <p className="text-primary-50 mt-2">
            Kimlik + selfie + vergi levhası onayı ile güvenilir üye olun
          </p>
        </div>
      </div>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <KayitForm iller={iller || []} kategoriler={kategoriler || []} />
      </main>
      <Footer />
    </>
  );
}
