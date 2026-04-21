import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Tag, ArrowRight, ChevronRight, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { kategori: string } }): Promise<Metadata> {
  const kat = decodeURIComponent(params.kategori);
  return {
    title: `${kat} Yazıları - Blog`,
    description: `${kat} kategorisindeki blog yazıları.`,
    alternates: { canonical: `/blog/kategori/${params.kategori}` },
  };
}

export default async function BlogKategoriPage({ params }: { params: { kategori: string } }) {
  const supabase = createAdminClient();
  const kat = decodeURIComponent(params.kategori);

  const { data: yazilar } = await supabase
    .from('blog_yazilar')
    .select('*')
    .eq('yayinda', true)
    .ilike('kategori', kat)
    .order('created_at', { ascending: false });

  if (!yazilar || yazilar.length === 0) {
    // Boş kategori yine de göster
  }

  return (
    <>
      <Header />

      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
          <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-primary-600">Blog</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-900">{kat}</span>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="font-heading font-extrabold text-3xl flex items-center gap-2">
            <Tag size={28} /> {kat}
          </h1>
          <p className="text-primary-50 mt-2">
            {yazilar?.length || 0} yazı bu kategoride
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {yazilar && yazilar.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {yazilar.map((y: any) => (
              <article key={y.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
                <Link href={`/blog/${y.slug}`}>
                  {y.kapak_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={y.kapak_url} alt={y.baslik} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-primary-300 to-accent-400" />
                  )}
                </Link>
                <div className="p-4">
                  <Link href={`/blog/${y.slug}`}>
                    <h3 className="font-heading font-bold text-lg text-gray-900 hover:text-primary-600 line-clamp-2">
                      {y.baslik}
                    </h3>
                  </Link>
                  {y.ozet && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{y.ozet}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(y.created_at).toLocaleDateString('tr-TR')}
                    </span>
                    <Link href={`/blog/${y.slug}`} className="text-primary-600 font-semibold flex items-center gap-1">
                      Devamı <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">Yazı Bulunamadı</h3>
            <p className="text-sm text-gray-500 mb-4">
              &quot;{kat}&quot; kategorisinde henüz yazı yok.
            </p>
            <Link href="/blog" className="inline-block bg-primary-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-primary-600">
              Tüm Yazılar
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
