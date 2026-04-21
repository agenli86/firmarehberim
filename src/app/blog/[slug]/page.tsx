import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Tag, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: yazi } = await supabase.from('blog_yazilar').select('*').eq('slug', params.slug).single();
  if (!yazi) return { title: 'Bulunamadı' };
  return {
    title: yazi.seo_title || yazi.baslik,
    description: yazi.seo_description || yazi.ozet || '',
    alternates: { canonical: `/blog/${yazi.slug}` },
    openGraph: {
      title: yazi.baslik,
      description: yazi.seo_description || yazi.ozet || '',
      images: yazi.og_image || yazi.kapak_url ? [yazi.og_image || yazi.kapak_url] : undefined,
      type: 'article',
    },
  };
}

export default async function BlogDetayPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();
  const { data: yazi } = await supabase.from('blog_yazilar').select('*').eq('slug', params.slug).eq('yayinda', true).single();
  if (!yazi) notFound();

  // Görüntülenme artır
  await supabase.from('blog_yazilar').update({ goruntulenme: (yazi.goruntulenme || 0) + 1 }).eq('id', yazi.id);

  // İlgili yazılar (aynı kategoriden)
  const { data: ilgili } = await supabase
    .from('blog_yazilar')
    .select('id, baslik, slug, kapak_url, created_at')
    .eq('yayinda', true)
    .neq('id', yazi.id)
    .eq('kategori', yazi.kategori)
    .order('created_at', { ascending: false })
    .limit(3);

  // Son yazılar
  const { data: sonYazilar } = await supabase
    .from('blog_yazilar')
    .select('id, baslik, slug, kapak_url, created_at')
    .eq('yayinda', true)
    .neq('id', yazi.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const etiketler = (yazi.etiketler || '').split(',').map((t: string) => t.trim()).filter(Boolean);

  return (
    <>
      <Header />

      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
          <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-primary-600">Blog</Link>
          {yazi.kategori && (
            <>
              <ChevronRight size={12} />
              <Link href={`/blog/kategori/${yazi.kategori.toLowerCase()}`} className="hover:text-primary-600">{yazi.kategori}</Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-900 truncate">{yazi.baslik}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <article className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {yazi.kapak_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={yazi.kapak_url} alt={yazi.baslik} className="w-full h-64 sm:h-80 object-cover" />
            )}
            <div className="p-6 sm:p-8">
              {yazi.kategori && (
                <Link href={`/blog/kategori/${yazi.kategori.toLowerCase()}`} className="text-xs font-bold text-primary-600 uppercase tracking-wide hover:underline">
                  {yazi.kategori}
                </Link>
              )}
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-gray-900 mt-2 leading-tight">
                {yazi.baslik}
              </h1>

              <div className="flex items-center gap-4 mt-4 pb-4 border-b border-gray-200 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <User size={14} /> {yazi.yazar || 'Admin'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {new Date(yazi.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {yazi.goruntulenme > 0 && (
                  <span>{yazi.goruntulenme} okuma</span>
                )}
              </div>

              {yazi.ozet && (
                <p className="text-lg text-gray-700 mt-4 font-medium italic">{yazi.ozet}</p>
              )}

              {yazi.icerik && (
                <div
                  className="prose mt-6"
                  dangerouslySetInnerHTML={{ __html: yazi.icerik }}
                />
              )}

              {etiketler.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-500" />
                  {etiketler.map((e: string) => (
                    <span key={e} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {e}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link href="/blog" className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline">
                  <ArrowLeft size={16} /> Tüm Yazılara Dön
                </Link>
              </div>
            </div>
          </article>

          <aside className="space-y-6">
            {ilgili && ilgili.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-heading font-bold text-base mb-3">İlgili Yazılar</h3>
                <ul className="space-y-3">
                  {ilgili.map((y: any) => (
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
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-heading font-bold text-base mb-3">Son Yazılar</h3>
              <ul className="space-y-3">
                {sonYazilar?.map((y: any) => (
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
