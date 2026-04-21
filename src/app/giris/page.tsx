import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GirisForm from './GirisForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Firma Girişi',
  description: 'Firma panelinize giriş yapın.',
  robots: { index: false, follow: false },
};

export default function GirisPage() {
  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 mb-2">Firma Girişi</h1>
          <p className="text-sm text-gray-600 mb-6">Firma panelinize erişin.</p>
          <GirisForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
