import Link from 'next/link';
import { Phone, MapPin, CheckCircle2, Star, MessageCircle, ChevronRight } from 'lucide-react';

export default function FirmaCard({ firma, sira }: { firma: any; sira?: number }) {
  // Yorum bilgileri firma objesinden gelsin (parent join ile çekti)
  const yorumSayisi = firma.yorum_sayisi || 0;
  const ortalama = firma.yorum_ortalamasi || 0;

  // WhatsApp link
  const waNum = (firma.whatsapp || firma.telefon || '').replace(/\D/g, '');
  const waMsg = encodeURIComponent(firma.whatsapp_mesaj || 'Merhaba, nakliyat konusunda bilgi almak istiyorum.');
  const waLink = waNum.length >= 10 ? `https://wa.me/90${waNum.replace(/^0+/, '').replace(/^90/, '')}?text=${waMsg}` : null;

  return (
    <div className={`bg-white rounded-lg border ${firma.one_cikan ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'} overflow-hidden hover:shadow-lg transition-shadow flex flex-col`}>
      {/* Üst alan - Logo + İsim + Konum */}
      <div className="flex items-start gap-3 p-4">
        <div className="shrink-0">
          {firma.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firma.logo_url} alt={firma.firma_adi} className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
              {firma.firma_adi.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/firma/${firma.slug}`} className="font-heading font-bold text-gray-900 hover:text-primary-600 text-base leading-tight block">
              {firma.firma_adi}
            </Link>
            {sira !== undefined && sira <= 3 && (
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded shrink-0">
                #{sira}
              </span>
            )}
          </div>

          {/* Konum (il + ilçe) ve kategori */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 flex-wrap">
            {firma.iller && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {firma.iller.ad}
                {firma.ilceler && ` / ${firma.ilceler.ad}`}
              </span>
            )}
            {firma.kategoriler && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-primary-600 font-medium">{firma.kategoriler.ad}</span>
              </>
            )}
          </div>

          {/* Yorum/Puan satırı */}
          {yorumSayisi > 0 ? (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} className={i <= Math.round(ortalama) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-900">{ortalama.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({yorumSayisi} yorum)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} className="text-gray-300" />
                ))}
              </div>
              <span className="text-xs text-gray-400 italic">Henüz yorum yok</span>
            </div>
          )}

          {/* Etiketler */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {firma.durum === 'onayli' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                <CheckCircle2 size={10} /> Onaylı
              </span>
            )}
            {firma.one_cikan && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                <Star size={10} /> Öne Çıkan
              </span>
            )}
            {firma.premium && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 px-1.5 py-0.5 rounded">
                PREMIUM
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Adres satırı (varsa) */}
      {firma.adres && (
        <div className="px-4 pb-2 text-xs text-gray-600 flex items-start gap-1.5 leading-snug">
          <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{firma.adres}</span>
        </div>
      )}

      {/* Telefon */}
      <div className="px-4 pb-3 mt-auto">
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <Phone size={14} className="text-primary-500" />
          <span className="font-mono font-semibold">{firma.telefon}</span>
        </div>
      </div>

      {/* Aksiyon butonları */}
      <div className="border-t border-gray-100 flex divide-x divide-gray-100">
        <a
          href={`tel:${firma.telefon}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50"
        >
          <Phone size={14} /> Ara
        </a>
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-green-600 hover:bg-green-50"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        )}
        <Link
          href={`/firma/${firma.slug}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Detay
        </Link>
      </div>
    </div>
  );
}
