'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TeklifForm({
  iller,
  kategoriler,
}: {
  iller: { id: number; ad: string }[];
  kategoriler: { id: number; ad: string }[];
}) {
  const supabase = createClient();
  const [adim, setAdim] = useState(1);
  const [loading, setLoading] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [hata, setHata] = useState('');

  const [form, setForm] = useState({
    // Kişisel
    ad_soyad: '',
    telefon: '',
    email: '',
    // Nakliye bilgileri
    nereden_il_id: '',
    nereye_il_id: '',
    kategori_id: '',
    tarih: '',
    // Ev/Mekan detayları
    ev_tipi: '',
    oda_sayisi: '',
    cikis_kat: '',
    varis_kat: '',
    cikis_asansor: false,
    varis_asansor: false,
    esya_durumu: 'hepsi',
    paketleme: false,
    sigorta: false,
    depolama: false,
    aciklama: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    if (!form.ad_soyad || !form.telefon) return setHata('Ad soyad ve telefon zorunlu.');
    setLoading(true);
    const { error } = await supabase.from('talepler').insert({
      ad_soyad: form.ad_soyad,
      telefon: form.telefon,
      email: form.email || null,
      nereden_il_id: form.nereden_il_id ? parseInt(form.nereden_il_id) : null,
      nereye_il_id: form.nereye_il_id ? parseInt(form.nereye_il_id) : null,
      kategori_id: form.kategori_id ? parseInt(form.kategori_id) : null,
      tarih: form.tarih || null,
      ev_tipi: form.ev_tipi || null,
      oda_sayisi: form.oda_sayisi ? parseInt(form.oda_sayisi) : null,
      cikis_kat: form.cikis_kat ? parseInt(form.cikis_kat) : null,
      varis_kat: form.varis_kat ? parseInt(form.varis_kat) : null,
      cikis_asansor: form.cikis_asansor,
      varis_asansor: form.varis_asansor,
      esya_durumu: form.esya_durumu,
      paketleme: form.paketleme,
      sigorta: form.sigorta,
      depolama: form.depolama,
      aciklama: form.aciklama || null,
    });
    setLoading(false);
    if (error) return setHata(error.message);
    setBasarili(true);
  };

  if (basarili) {
    return (
      <div className="bg-white rounded-lg border border-green-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-green-600" size={32} />
        </div>
        <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">Talebiniz Alındı!</h2>
        <p className="text-gray-600">
          En kısa sürede size uygun nakliyat firmaları iletişime geçecek.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Step indicator */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              adim >= s ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {adim > s ? <CheckCircle2 size={16} /> : s}
            </div>
            <div className={`text-xs font-semibold hidden sm:block ${adim >= s ? 'text-gray-900' : 'text-gray-400'}`}>
              {s === 1 ? 'Nereden/Nereye' : s === 2 ? 'Detaylar' : 'İletişim'}
            </div>
            {s < 3 && <div className={`h-0.5 flex-1 ${adim > s ? 'bg-primary-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {hata && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {hata}
          </div>
        )}

        {/* ADIM 1: Nereden Nereye */}
        {adim === 1 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg mb-2">Nakliye Bilgileri</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nereden *</label>
                <select value={form.nereden_il_id} onChange={(e) => setForm({ ...form, nereden_il_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
                  <option value="">İl seçin</option>
                  {iller.map((il) => <option key={il.id} value={il.id}>{il.ad}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nereye *</label>
                <select value={form.nereye_il_id} onChange={(e) => setForm({ ...form, nereye_il_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
                  <option value="">İl seçin</option>
                  {iller.map((il) => <option key={il.id} value={il.id}>{il.ad}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hizmet Tipi</label>
                <select value={form.kategori_id} onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
                  <option value="">Seçin</option>
                  {kategoriler.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Planlanan Tarih</label>
                <input type="date" value={form.tarih} onChange={(e) => setForm({ ...form, tarih: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setAdim(2)}
                className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600 flex items-center gap-2">
                Devam <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ADIM 2: Detaylar */}
        {adim === 2 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg mb-2">Taşıma Detayları</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ev/Mekan Tipi</label>
                <select value={form.ev_tipi} onChange={(e) => setForm({ ...form, ev_tipi: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
                  <option value="">Seçin</option>
                  <option value="1+0">1+0 Stüdyo</option>
                  <option value="1+1">1+1</option>
                  <option value="2+1">2+1</option>
                  <option value="3+1">3+1</option>
                  <option value="4+1">4+1</option>
                  <option value="5+1">5+1 ve üzeri</option>
                  <option value="villa">Villa</option>
                  <option value="ofis">Ofis</option>
                  <option value="dukkan">Dükkan/Mağaza</option>
                  <option value="parca">Parça Eşya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Oda Sayısı</label>
                <input type="number" min="0" value={form.oda_sayisi} onChange={(e) => setForm({ ...form, oda_sayisi: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" placeholder="3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-semibold text-sm text-gray-700 mb-2">📤 Çıkılan Adres</div>
                <label className="block text-xs text-gray-600 mb-1">Kaçıncı Kat?</label>
                <input type="number" min="0" value={form.cikis_kat} onChange={(e) => setForm({ ...form, cikis_kat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" placeholder="3" />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.cikis_asansor} onChange={(e) => setForm({ ...form, cikis_asansor: e.target.checked })} />
                  Asansör var
                </label>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-semibold text-sm text-gray-700 mb-2">📥 Gidilen Adres</div>
                <label className="block text-xs text-gray-600 mb-1">Kaçıncı Kat?</label>
                <input type="number" min="0" value={form.varis_kat} onChange={(e) => setForm({ ...form, varis_kat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" placeholder="2" />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.varis_asansor} onChange={(e) => setForm({ ...form, varis_asansor: e.target.checked })} />
                  Asansör var
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Eşya Durumu</label>
              <select value={form.esya_durumu} onChange={(e) => setForm({ ...form, esya_durumu: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
                <option value="hepsi">Eşyaların hepsi taşınacak</option>
                <option value="buyuk_esya">Sadece büyük eşyalar</option>
                <option value="beyaz_esya">Sadece beyaz eşya</option>
                <option value="parca">Birkaç parça eşya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ek Hizmetler</label>
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.paketleme} onChange={(e) => setForm({ ...form, paketleme: e.target.checked })} />
                  📦 Paketleme hizmeti istiyorum
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.sigorta} onChange={(e) => setForm({ ...form, sigorta: e.target.checked })} />
                  🛡️ Sigortalı taşıma istiyorum
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.depolama} onChange={(e) => setForm({ ...form, depolama: e.target.checked })} />
                  🏢 Depolama hizmeti istiyorum
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setAdim(1)}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200 flex items-center gap-2">
                <ArrowLeft size={16} /> Geri
              </button>
              <button type="button" onClick={() => setAdim(3)}
                className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600 flex items-center gap-2">
                Devam <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ADIM 3: İletişim */}
        {adim === 3 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg mb-2">İletişim Bilgileri</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad *</label>
                <input type="text" required value={form.ad_soyad} onChange={(e) => setForm({ ...form, ad_soyad: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon *</label>
                <input type="tel" required value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" placeholder="0532..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ek Açıklama</label>
              <textarea rows={3} value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                placeholder="Eklemek istediğiniz başka detay..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" />
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setAdim(2)} disabled={loading}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200 flex items-center gap-2">
                <ArrowLeft size={16} /> Geri
              </button>
              <button type="submit" disabled={loading}
                className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {loading ? 'Gönderiliyor...' : 'Ücretsiz Teklif İste'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
