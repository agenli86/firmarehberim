'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function IletisimForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [hata, setHata] = useState('');
  const [form, setForm] = useState({
    ad_soyad: '',
    email: '',
    telefon: '',
    konu: '',
    mesaj: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    if (!form.ad_soyad || !form.mesaj) return setHata('Ad soyad ve mesaj zorunlu.');
    setLoading(true);
    const { error } = await supabase.from('iletisim_mesajlari').insert({
      ad_soyad: form.ad_soyad,
      email: form.email || null,
      telefon: form.telefon || null,
      konu: form.konu || null,
      mesaj: form.mesaj,
    });
    setLoading(false);
    if (error) return setHata(error.message);
    setBasarili(true);
  };

  if (basarili) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <CheckCircle2 className="text-green-600 mx-auto mb-2" size={40} />
        <h3 className="font-bold text-green-800 text-lg">Mesajınız alındı!</h3>
        <p className="text-green-700 text-sm mt-1">En kısa sürede size dönüş yapacağız.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-heading font-bold text-xl mb-2">Bize Yazın</h3>
      {hata && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {hata}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad *</label>
          <input type="text" required value={form.ad_soyad} onChange={(e) => setForm({ ...form, ad_soyad: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
          <input type="tel" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Konu</label>
          <input type="text" value={form.konu} onChange={(e) => setForm({ ...form, konu: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Mesajınız *</label>
        <textarea required rows={5} value={form.mesaj} onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
      </div>

      <button type="submit" disabled={loading}
        className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {loading ? 'Gönderiliyor...' : 'Gönder'}
      </button>
    </form>
  );
}
