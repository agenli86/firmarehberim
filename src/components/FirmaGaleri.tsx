'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FirmaGaleri({ galeri }: { galeri: { id: number; gorsel_url: string; baslik: string | null }[] }) {
  const [aktif, setAktif] = useState<number | null>(null);

  const ileri = () => aktif !== null && setAktif((aktif + 1) % galeri.length);
  const geri = () => aktif !== null && setAktif((aktif - 1 + galeri.length) % galeri.length);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {galeri.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setAktif(i)}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.gorsel_url} alt={g.baslik || ''} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {aktif !== null && galeri[aktif] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setAktif(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setAktif(null); }}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <X size={24} />
          </button>
          {galeri.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); geri(); }}
                className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); ileri(); }}
                className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={galeri[aktif].gorsel_url}
            alt={galeri[aktif].baslik || ''}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
