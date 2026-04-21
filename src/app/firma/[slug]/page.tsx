import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, MapPin, Mail, Globe, MessageCircle, CheckCircle2, Star, ChevronRight, Calendar, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReklamSidebar from '@/components/ReklamSidebar';
import DefterMesajCard from '@/components/DefterMesajCard';
import YorumBolum from '@/components/YorumBolum';
import FirmaGaleri from '@/components/FirmaGaleri';
import { createAdminClient } from '@/lib/supabase/admin';
import { katildiTarihi } from '@/lib/utils';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: firma } = await supabase.from('firmalar').select('firma_adi, hakkinda, iller:il_id(ad), kategoriler:kategori_id(ad)').eq('slug', params.slug).single();
  if (!firma) return { title: 'Bulunamadı' };

  const il = (firma.iller as any)?.ad || '';
  const kat = (firma.kategoriler as any)?.ad || '';
  const title = `${firma.firma_adi}${il ? ` - ${il}` : ''}${kat ? ` ${kat}` : ''}`;
  const description = firma.hakkinda?.replace(/<[^>]+>/g, '').slice(0, 160) || `${firma.firma_adi} nakliyat firması bilgileri, iletişim ve yorumlar.`;

  return {
    title,
    description,
    alternates: { canonical: `/firma/${params.slug}` },
  };
}

export default async function FirmaDetayPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();

  const { data: firma } = await supabase
    .from('firmalar')
    .select(`*, iller:il_id (ad, slug), kategoriler:kategori_id (ad, slug), ilceler:ilce_id (ad, slug)`)
    .eq('slug', params.slug)
    .eq('durum', 'onayli')
    .single();

  if (!firma) notFound();

  const [{ data: defterMesajlari }, { data: galeri }, { data: yorumlar }] = await Promise.all([
    supabase
      .from('defter_mesajlari')
      .select(`*, firmalar:firma_id (id, firma_adi, slug, telefon, durum, created_at),
               nereden:nereden_il_id (ad, slug), nereye:nereye_il_id (ad, slug)`)
      .eq('firma_id', firma.id)
      .eq('aktif', true)
      .eq('silindi', false)
      .eq('onay_durum', 'onayli')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('firma_galeri').select('*').eq('firma_id', firma.id).order('sira'),
    supabase.from('firma_yorumlari').select('*').eq('firma_id', firma.id).eq('onaylandi', true).order('created_at', { ascending: false }),
  ]);

  // Ortalama puan
  const puanlar = (yorumlar || []).map((y) => y.puan);
  const ortalamaPuan = puanlar.length > 0 ? (puanlar.reduce((a, b) => a + b, 0) / puanlar.length) : 0;

  // Görüntülenme artır
  await supabase.from('firmalar').update({ goruntulenme: (firma.goruntulenme || 0) + 1 }).eq('id', firma.id);

  // WhatsApp link
  const waNum = (firma.whatsapp || firma.telefon || '').replace(/\D/g, '');
  const waMsg = encodeURIComponent(firma.whatsapp_mesaj || 'Merhaba, nakliyat konusunda bilgi almak istiyorum.');
  const waLink = waNum.length >= 10 ? `https://wa.me/90${waNum.replace(/^0+/, '').replace(/^90/, '')}?text=${waMsg}` : null;

  return (
    <>
      <Header />

      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
          <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <Link href="/firmalar" className="hover:text-primary-600">Firmalar</Link>
          {firma.iller && (
            <>
              <ChevronRight size={12} />
              <Link href={`/firmalar/${firma.iller.slug}`} className="hover:text-primary-600">{firma.iller.ad}</Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-900 truncate">{firma.firma_adi}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Firma başlık */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-20" />
              <div className="p-6 -mt-16">
                <div className="flex items-end gap-4 mb-4">
                  {firma.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firma.logo_url} alt={firma.firma_adi} className="w-28 h-28 rounded-xl object-cover border-4 border-white bg-white shadow-md" />
                  ) : (
                    <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-4xl">
                      {firma.firma_adi.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">{firma.firma_adi}</h1>

                    {/* Puan & Yorum */}
                    {yorumlar && yorumlar.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={18} className={i <= Math.round(ortalamaPuan) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        <span className="font-bold text-gray-900">{ortalamaPuan.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({yorumlar.length} yorum)</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
                        <CheckCircle2 size={12} /> Onaylı Firma
                      </span>
                      {firma.one_cikan && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                          <Star size={12} /> Öne Çıkan
                        </span>
                      )}
                      {firma.premium && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 px-2 py-1 rounded">
                          PREMIUM
                        </span>
                      )}
                      {firma.iller && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
                          <MapPin size={12} /> {firma.iller.ad}
                          {firma.ilceler && ` / ${firma.ilceler.ad}`}
                        </span>
                      )}
                      {firma.kategoriler && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary-700 bg-primary-50 border border-primary-200 px-2 py-1 rounded">
                          {firma.kategoriler.ad}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Calendar size={12} /> {katildiTarihi(firma.created_at)} tarihinden beri üye
                    </div>
                  </div>
                </div>

                {/* Aksiyon butonları - WhatsApp + Ara */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
                  <a href={`tel:${firma.telefon}`} className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-bold text-base">
                    <Phone size={20} /> Hemen Ara: {firma.telefon}
                  </a>
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-base">
                      <MessageCircle size={20} /> WhatsApp ile Mesaj At
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* İletişim bilgileri */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-heading font-bold text-lg mb-4 text-gray-900">İletişim Bilgileri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href={`tel:${firma.telefon}`} className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100">
                  <Phone className="text-primary-600" size={20} />
                  <div>
                    <div className="text-xs text-gray-500">Telefon</div>
                    <div className="font-semibold text-gray-900">{firma.telefon}</div>
                  </div>
                </a>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
                    <MessageCircle className="text-green-600" size={20} />
                    <div>
                      <div className="text-xs text-gray-500">WhatsApp</div>
                      <div className="font-semibold text-gray-900">{firma.whatsapp || firma.telefon}</div>
                    </div>
                  </a>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Mail className="text-gray-600" size={20} />
                  <div>
                    <div className="text-xs text-gray-500">E-posta</div>
                    <div className="font-semibold text-gray-900 text-sm">{firma.email}</div>
                  </div>
                </div>
                {firma.website && (
                  <a href={firma.website} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                    <Globe className="text-gray-600" size={20} />
                    <div>
                      <div className="text-xs text-gray-500">Web Sitesi</div>
                      <div className="font-semibold text-gray-900 text-sm truncate">{firma.website}</div>
                    </div>
                  </a>
                )}
              </div>
              {firma.adres && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
                  <MapPin className="text-gray-600 mt-0.5" size={16} />
                  <div className="text-sm text-gray-700">{firma.adres}</div>
                </div>
              )}
            </div>

            {/* Harita - Google Maps embed */}
            {firma.harita_embed && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-heading font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-primary-500" /> Konum
                </h2>
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ aspectRatio: '16/9' }}
                  dangerouslySetInnerHTML={{ __html: firma.harita_embed }}
                />
              </div>
            )}

            {/* Hakkında */}
            {firma.hakkinda && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-heading font-bold text-lg mb-3 text-gray-900">Hakkında</h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: firma.hakkinda }} />
              </div>
            )}

            {/* Galeri */}
            {galeri && galeri.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="font-heading font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
                  <ImageIcon size={20} className="text-primary-500" /> Galeri
                </h2>
                <FirmaGaleri galeri={galeri} />
              </div>
            )}

            {/* Defter mesajları */}
            {defterMesajlari && defterMesajlari.length > 0 && (
              <div>
                <h2 className="font-heading font-bold text-lg mb-3 text-gray-900">
                  {firma.firma_adi} İlanları
                </h2>
                <div className="space-y-3">
                  {defterMesajlari.map((m: any) => (
                    <DefterMesajCard key={m.id} mesaj={m} telGoster />
                  ))}
                </div>
              </div>
            )}

            {/* Yorumlar */}
            <YorumBolum
              firmaId={firma.id}
              firmaAdi={firma.firma_adi}
              yorumlar={yorumlar || []}
              ortalama={ortalamaPuan}
            />
          </div>

          <ReklamSidebar sayfa="firma" />
        </div>
      </main>

      <Footer />
    </>
  );
}
