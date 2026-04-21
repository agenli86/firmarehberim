import Link from 'next/link';
import { Send, Sparkles } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Reklam } from '@/lib/types';

export default async function ReklamSidebar({ sayfa = 'hepsi' }: { sayfa?: string }) {
  const supabase = createAdminClient();
  const { data: reklamlar } = await supabase
    .from('reklamlar')
    .select('*')
    .eq('aktif', true)
    .eq('pozisyon', 'sag')
    .or(`sayfa.eq.hepsi,sayfa.eq.${sayfa}`)
    .order('sira', { ascending: true });

  return (
    <aside className="space-y-4">
      {/* CTA Banner - "Formu doldur, 4 firmadan teklif al" */}
      <Link
        href="/teklif-al"
        className="block relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 text-white p-5 hover:shadow-xl transition-all hover:-translate-y-0.5 group"
      >
        <div className="absolute -top-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={80} />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide mb-2">
            <Sparkles size={11} /> Ücretsiz
          </div>
          <h3 className="font-heading font-extrabold text-lg leading-tight mb-1">
            Formu Doldurun
          </h3>
          <p className="text-2xl font-extrabold leading-tight mb-3">
            4 Firmadan<br />
            <span className="text-amber-200">Teklif Alın!</span>
          </p>
          <div className="bg-white text-primary-700 rounded-lg px-3 py-2.5 text-center font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-amber-100">
            <Send size={14} /> Hemen Teklif Al
          </div>
        </div>
      </Link>

      {/* Reklamlar */}
      {(!reklamlar || reklamlar.length === 0) ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 text-sm">
          Reklam alanı
        </div>
      ) : (
        reklamlar.map((reklam: Reklam) => (
          <a
            key={reklam.id}
            href={reklam.link || '#'}
            target={reklam.link ? '_blank' : undefined}
            rel="noopener sponsored"
            className="block rounded-lg overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={reklam.gorsel_url} alt={reklam.baslik} className="w-full h-auto" />
          </a>
        ))
      )}
    </aside>
  );
}
