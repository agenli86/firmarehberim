import Link from 'next/link';
import { Calendar, User, Tag, ArrowRight, Star, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Blog - Nakliyat Rehberi',
  description: 'Nakliyat, taşınma ve sektörel rehber yazıları.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const supabase = createAdminClient();
  const { data: yazilar } = await supabase
    .from('blog_yazilar')
    .select('*')
    .eq('yayinda', true)
    .order('created_at', { ascending: false });

  const oneCikan = yazilar?.filter((y) => y.one_cikan) || [];
  const digerYazilar = yazilar?.filter((y) => !y.one_cikan) || [];
  const kategoriler = Array.from(new Set((yazilar || []).map((y) => y.kategori).filter(Boolean)));
  const sonYazilar = (yazilar || []).slice(0, 5);

  return (
    <>
      <Header />

      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl flex items-center gap-2">
            <BookOpen size={32} /> Blog
          </h1>
          <p className="text-primary-50 mt-2">
            Nakliyat ve taşınma hakkında güncel rehber yazıları
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Ana içerik */}
          <div className="space-y-6">
            {/* Öne Çıkan Yazılar */}
            {oneCikan.length > 0 && (
              <section>
                <h2 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500" size={22} /> Öne Çıkan Yazılar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {oneCikan.map((y: any) => (
                    <BlogCard key={y.id} yazi={y} featured />
                  ))}
                </div>
              </section>
            )}

            {/* Diğer Yazılar */}
            {digerYazilar.length > 0 && (
              <section>
                {oneCikan.length > 0 && (
                  <h2 className="font-heading font-bold text-xl mb-4">Tüm Yazılar</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {digerYazilar.map((y: any) => (
                    <BlogCard key={y.id} yazi={y} />
                  ))}
                </div>
              </section>
            )}

            {(yazilar?.length || 0) === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Henüz blog yazısı yok.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Kategoriler */}
            {kategoriler.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-heading font-bold text-base mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-primary-500" /> Kategoriler
                </h3>
                <ul className="space-y-1.5">
                  {kategoriler.map((k) => (
                    <li key={k}>
                      <Link href={`/blog/kategori/${encodeURIComponent(k!.toLowerCase())}`} className="text-sm text-gray-700 hover:text-primary-600 flex items-center justify-between">
                        <span>{k}</span>
                        <span className="text-xs text-gray-400">
                          {yazilar?.filter((y) => y.kategori === k).length}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Son yazılar */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-heading font-bold text-base mb-3">Son Yazılar</h3>
              <ul className="space-y-3">
                {sonYazilar.map((y: any) => (
                  <li key={y.id}>
                    <Link href={`/blog/${y.slug}`} className="group flex gap-2">
                      {y.kapak_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={y.kapak_url} alt="" className="w-14 h-14 rounded object-cover shrink-0" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2">
                          {y.baslik}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(y.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

function BlogCard({ yazi, featured }: { yazi: any; featured?: boolean }) {
  return (
    <article className={`bg-white rounded-lg border ${featured ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'} overflow-hidden hover:shadow-md transition`}>
      <Link href={`/blog/${yazi.slug}`}>
        {yazi.kapak_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={yazi.kapak_url} alt={yazi.baslik} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-primary-300 to-accent-400" />
        )}
      </Link>
      <div className="p-4">
        {yazi.kategori && (
          <Link href={`/blog/kategori/${yazi.kategori.toLowerCase()}`} className="text-xs font-bold text-primary-600 uppercase tracking-wide hover:underline">
            {yazi.kategori}
          </Link>
        )}
        <Link href={`/blog/${yazi.slug}`}>
          <h3 className="font-heading font-bold text-lg mt-1 text-gray-900 hover:text-primary-600 line-clamp-2">
            {yazi.baslik}
          </h3>
        </Link>
        {yazi.ozet && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{yazi.ozet}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {new Date(yazi.created_at).toLocaleDateString('tr-TR')}
          </span>
          <Link href={`/blog/${yazi.slug}`} className="text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Devamı <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
