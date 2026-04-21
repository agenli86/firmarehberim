'use client';

import { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Yorum = {
  id: number;
  ad_soyad: string;
  yorum: string;
  puan: number;
  admin_cevap: string | null;
  created_at: string;
};

export default function YorumBolum({
  firmaId,
  firmaAdi,
  yorumlar,
  ortalama,
}: {
  firmaId: string;
  firmaAdi: string;
  yorumlar: Yorum[];
  ortalama: number;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({ ad_soyad: '', email: '', yorum: '', puan: 0 });
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [hata, setHata] = useState('');
  const [formAcik, setFormAcik] = useState(false);

  const gonder = async () => {
    setHata('');
    if (!form.ad_soyad || !form.yorum) return setHata('Ad soyad ve yorum zorunlu.');
    if (form.puan < 1) return setHata('Lütfen puan verin (1-5 yıldız).');
    setLoading(true);
    const { error } = await supabase.from('firma_yorumlari').insert({
      firma_id: firmaId,
      ad_soyad: form.ad_soyad,
      email: form.email || null,
      yorum: form.yorum,
      puan: form.puan,
      onaylandi: false, // admin onaylayacak
    });
    setLoading(false);
    if (error) return setHata(error.message);
    setBasarili(true);
    setForm({ ad_soyad: '', email: '', yorum: '', puan: 0 });
  };

  // Puan dağılımı
  const dagilim = [5, 4, 3, 2, 1].map((p) => ({
    puan: p,
    sayi: yorumlar.filter((y) => y.puan === p).length,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="font-heading font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
        <MessageSquare size={20} className="text-primary-500" /> Müşteri Yorumları
      </h2>

      {/* Özet */}
      {yorumlar.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="text-center">
            <div className="text-5xl font-extrabold text-gray-900">{ortalama.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={20} className={i <= Math.round(ortalama) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">{yorumlar.length} yorum</div>
          </div>
          <div>
            {dagilim.map(({ puan, sayi }) => {
              const yuzde = yorumlar.length > 0 ? (sayi / yorumlar.length) * 100 : 0;
              return (
                <div key={puan} className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-3 text-right">{puan}</span>
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${yuzde}%` }} />
                  </div>
                  <span className="w-8 text-right text-gray-500">{sayi}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 mb-4 bg-gray-50 rounded-lg">
          <Star className="text-gray-300 mx-auto mb-2" size={32} />
          <p className="text-sm text-gray-500">Henüz yorum yok. İlk yorumu siz yazın!</p>
        </div>
      )}

      {/* Yorum yazma formu */}
      {!formAcik && !basarili && (
        <button
          onClick={() => setFormAcik(true)}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 mb-6"
        >
          <MessageSquare size={16} /> Yorum Yaz
        </button>
      )}

      {basarili && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-6">
          <CheckCircle2 className="text-green-600 mx-auto mb-2" size={24} />
          <p className="text-sm font-semibold text-green-800">Yorumunuz alındı!</p>
          <p className="text-xs text-green-700 mt-1">Admin onayından sonra yayınlanacak.</p>
        </div>
      )}

      {formAcik && !basarili && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">{firmaAdi} için yorum yaz</h3>
          {hata && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-3 flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {hata}
            </div>
          )}

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Puan *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, puan: i })}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1"
                >
                  <Star
                    size={28}
                    className={
                      i <= (hover || form.puan)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ad Soyad *</label>
              <input
                type="text"
                value={form.ad_soyad}
                onChange={(e) => setForm({ ...form, ad_soyad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">E-posta (yayınlanmaz)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Yorumunuz *</label>
            <textarea
              rows={3}
              value={form.yorum}
              onChange={(e) => setForm({ ...form, yorum: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Bu firma hakkındaki deneyiminizi yazın..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={gonder}
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? 'Gönderiliyor...' : 'Gönder'}
            </button>
            <button onClick={() => setFormAcik(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded font-semibold">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Yorum listesi */}
      {yorumlar.length > 0 && (
        <div className="space-y-4">
          {yorumlar.map((y) => (
            <div key={y.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{y.ad_soyad}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className={i <= y.puan ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(y.created_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{y.yorum}</p>
              {y.admin_cevap && (
                <div className="mt-3 p-3 bg-primary-50 border-l-4 border-primary-500 rounded">
                  <div className="text-xs font-semibold text-primary-700 mb-1">{firmaAdi} cevabı:</div>
                  <p className="text-sm text-gray-700">{y.admin_cevap}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
