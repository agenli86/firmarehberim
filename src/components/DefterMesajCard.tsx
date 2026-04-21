import Link from 'next/link';
import { Package, Truck, Megaphone, ArrowRight, MoreHorizontal, Phone } from 'lucide-react';
import { zamanOnce, katildiTarihi, maskTel } from '@/lib/utils';
import type { DefterMesaj } from '@/lib/types';

export default function DefterMesajCard({
  mesaj,
  telGoster = false,
}: {
  mesaj: DefterMesaj;
  telGoster?: boolean;
}) {
  const tipConfig = {
    yuk: { label: 'Yük/İş', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Package },
    bos_arac: { label: 'Boş Araç', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Truck },
    duyuru: { label: 'Duyuru', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Megaphone },
  };
  const cfg = tipConfig[mesaj.tip];
  const Icon = cfg.icon;
  const firma = mesaj.firmalar;

  return (
    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <header className="bg-primary-50 px-4 py-2 flex items-center justify-between border-b border-primary-100">
        <Link
          href={firma ? `/firma/${firma.slug}` : '#'}
          className="font-semibold text-sm text-gray-900 hover:text-primary-700 truncate"
        >
          {firma?.firma_adi || 'Firma'}
          {firma?.durum === 'onayli' && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500" title="Onaylı" />}
        </Link>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {firma?.created_at ? `${katildiTarihi(firma.created_at)} katıldı` : ''}
        </span>
      </header>

      <div className="p-4">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span className="font-mono">#{String(mesaj.id).padStart(8, '0')}</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>{zamanOnce(mesaj.created_at)}</span>
          <button className="ml-auto text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={16} />
          </button>
        </div>

        <p className="text-gray-800 text-sm leading-relaxed mb-3">{mesaj.mesaj}</p>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${cfg.color}`}>
            <Icon size={12} /> {cfg.label}
          </span>
          {(mesaj.nereden?.ad || mesaj.nereden_text) && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
              {mesaj.nereden?.ad || mesaj.nereden_text}
              <ArrowRight size={12} className="text-primary-500" />
              {mesaj.nereye?.ad || mesaj.nereye_text || '—'}
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 pt-3">
          {telGoster && firma?.telefon ? (
            <a
              href={`tel:${firma.telefon}`}
              className="flex items-center justify-center gap-2 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-semibold text-sm"
            >
              <Phone size={14} /> {firma.telefon}
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-400 rounded-md font-mono text-sm tracking-widest border border-dashed border-gray-200">
              {firma?.telefon ? maskTel(firma.telefon) : '*** *** ** **'}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
