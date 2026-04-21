import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-8xl font-extrabold text-primary-500 mb-4">404</div>
        <h1 className="font-heading font-bold text-2xl text-gray-900 mb-2">Sayfa Bulunamadı</h1>
        <p className="text-gray-600 mb-6">Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600">
            Ana Sayfa
          </Link>
          <Link href="/firmalar" className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50">
            Firmalar
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
