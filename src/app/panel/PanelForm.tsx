'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Il = { id: number; ad: string };

export default function PanelForm({ firmaId, iller }: { firmaId: string; iller: Il[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);
  const [form, setForm] = useState({
    tip: 'yuk' as 'yuk' | 'bos_arac' | 'duyuru',
    mesaj: '',
    nereden_il_id: '',
    nereye_il_id: '',
    nereden_text: '',
    nereye_text: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setBasarili(false);
    if (!form.mesaj.trim()) return setHata('Mesaj boş olamaz.');
    setLoading(true);

    const { error } = await supabase.from('defter_mesajlari').insert({
      firma_id: firmaId,
      tip: form.tip,
      mesaj: form.mesaj,
      nereden_il_id: form.nereden_il_id ? parseInt(form.nereden_il_id) : null,
      nereye_il_id: form.nereye_il_id ? parseInt(form.nereye_il_id) : null,
      nereden_text: form.nereden_text || null,
      nereye_text: form.nereye_text || null,
      onay_durum: 'beklemede',
    });

    setLoading(false);
    if (error) return setHata(error.message);
    setForm({ ...form, mesaj: '', nereden_text: '', nereye_text: '' });
    setBasarili(true);
    setTimeout(() => setBasarili(false), 5000);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {hata && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{hata}</div>
      )}
      {basarili && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm flex items-start gap-2">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <strong>Mesajınız alındı!</strong> Admin onayından sonra defterde yayınlanacak.
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {[
          { v: 'yuk', label: 'Yük/İş', bg: 'orange' },
          { v: 'bos_arac', label: 'Boş Araç', bg: 'blue' },
          { v: 'duyuru', label: 'Duyuru', bg: 'purple' },
        ].map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setForm({ ...form, tip: t.v as any })}
            className={`flex-1 py-2 rounded-md text-sm font-semibold border transition ${
              form.tip === t.v
                ? `bg-${t.bg}-100 text-${t.bg}-700 border-${t.bg}-300`
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={form.mesaj}
        onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
        rows={3}
        maxLength={500}
        placeholder="Örn: İstanbul'dan Ankara'ya 3 sıra eşya bakılır, 5 ton kapalı kasa..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nereden</label>
          <select
            value={form.nereden_il_id}
            onChange={(e) => setForm({ ...form, nereden_il_id: e.target.value })}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">İl seç</option>
            {iller.map((il) => (
              <option key={il.id} value={il.id}>{il.ad}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nereye</label>
          <select
            value={form.nereye_il_id}
            onChange={(e) => setForm({ ...form, nereye_il_id: e.target.value })}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">İl seç</option>
            {iller.map((il) => (
              <option key={il.id} value={il.id}>{il.ad}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Gönderiliyor...' : 'Deftere Gönder'}
      </button>
    </form>
  );
}
