'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Check, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

type Il = { id: number; ad: string; slug: string };
type Kategori = { id: number; ad: string; slug: string };

export default function KayitForm({ iller, kategoriler }: { iller: Il[]; kategoriler: Kategori[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [adim, setAdim] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    firma_adi: '',
    yetkili_ad_soyad: '',
    telefon: '',
    whatsapp: '',
    email: '',
    sifre: '',
    sifre_tekrar: '',
    il_id: '',
    kategori_id: '',
    adres: '',
    hakkinda: '',
    website: '',
    vergi_no: '',
    kvkk: false,
  });

  const [dosyalar, setDosyalar] = useState<{
    kimlik: File | null;
    selfie: File | null;
    vergi: File | null;
    logo: File | null;
  }>({ kimlik: null, selfie: null, vergi: null, logo: null });

  const uploadDosya = async (dosya: File, klasor: string): Promise<string | null> => {
    const ext = dosya.name.split('.').pop();
    const yol = `kayit/${klasor}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').upload(yol, dosya);
    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Dosya yüklenemedi (${klasor}): ${error.message}. Supabase storage policy kontrol edin.`);
    }
    const { data: urlData } = supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    setHata('');

    // Validasyon
    if (form.sifre !== form.sifre_tekrar) return setHata('Şifreler eşleşmiyor.');
    if (form.sifre.length < 6) return setHata('Şifre en az 6 karakter olmalı.');
    if (!form.kvkk) return setHata('KVKK ve sözleşmeyi kabul etmelisiniz.');
    if (!dosyalar.kimlik || !dosyalar.selfie || !dosyalar.vergi)
      return setHata('Kimlik, selfie ve vergi levhası zorunludur.');

    setLoading(true);
    try {
      // 1) Auth user oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.sifre,
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

      // 2) Dosyaları yükle
      const [kimlikUrl, selfieUrl, vergiUrl, logoUrl] = await Promise.all([
        uploadDosya(dosyalar.kimlik, 'kimlik'),
        uploadDosya(dosyalar.selfie, 'selfie'),
        uploadDosya(dosyalar.vergi, 'vergi'),
        dosyalar.logo ? uploadDosya(dosyalar.logo, 'logo') : Promise.resolve(null),
      ]);

      if (!kimlikUrl || !selfieUrl || !vergiUrl) throw new Error('Dosya yükleme hatası');

      // 3) Firma kaydı
      const slugBase = slugify(form.firma_adi);
      const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

      const { error: insertError } = await supabase.from('firmalar').insert({
        user_id: authData.user.id,
        firma_adi: form.firma_adi,
        slug,
        yetkili_ad_soyad: form.yetkili_ad_soyad,
        telefon: form.telefon,
        whatsapp: form.whatsapp || form.telefon,
        email: form.email,
        website: form.website || null,
        adres: form.adres || null,
        hakkinda: form.hakkinda || null,
        il_id: form.il_id ? parseInt(form.il_id) : null,
        kategori_id: form.kategori_id ? parseInt(form.kategori_id) : null,
        vergi_no: form.vergi_no || null,
        logo_url: logoUrl,
        kimlik_url: kimlikUrl,
        selfie_url: selfieUrl,
        vergi_levhasi_url: vergiUrl,
        durum: 'beklemede',
      });

      if (insertError) throw new Error(insertError.message);

      setBasarili(true);
    } catch (err: any) {
      setHata(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (basarili) {
    return (
      <div className="bg-white rounded-lg border border-green-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="text-green-600" size={32} />
        </div>
        <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">Kayıt Alındı!</h2>
        <p className="text-gray-600 mb-6">
          Başvurunuz incelemeye alındı. Kimlik + selfie + vergi levhası kontrolü yapıldıktan sonra firmanız onaylanacak.
          <br />
          <span className="text-sm">E-posta adresinizi kontrol edin, Supabase otomatik doğrulama maili gönderdiyse linke tıklayın.</span>
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.push('/giris')} className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600">
            Girişe Git
          </button>
          <button onClick={() => router.push('/')} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200">
            Ana Sayfa
          </button>
        </div>
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
              {adim > s ? <Check size={16} /> : s}
            </div>
            <div className={`text-xs font-semibold ${adim >= s ? 'text-gray-900' : 'text-gray-400'}`}>
              {s === 1 ? 'Firma Bilgileri' : s === 2 ? 'Belgeler' : 'Onay'}
            </div>
            {s < 3 && <div className={`h-0.5 flex-1 ${adim > s ? 'bg-primary-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="p-6">
        {hata && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {hata}
          </div>
        )}

        {adim === 1 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg mb-2">Firma Bilgileri</h3>

            <Input label="Firma Adı *" value={form.firma_adi} onChange={(v) => setForm({ ...form, firma_adi: v })} />
            <Input label="Yetkili Ad Soyad *" value={form.yetkili_ad_soyad} onChange={(v) => setForm({ ...form, yetkili_ad_soyad: v })} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Telefon *" value={form.telefon} onChange={(v) => setForm({ ...form, telefon: v })} placeholder="0532 ..." />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} placeholder="(boşsa telefon kullanılır)" />
            </div>

            <Input label="E-posta *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Şifre *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.sifre}
                    onChange={(e) => setForm({ ...form, sifre: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Input label="Şifre Tekrar *" type="password" value={form.sifre_tekrar} onChange={(v) => setForm({ ...form, sifre_tekrar: v })} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">İl *</label>
                <select
                  value={form.il_id}
                  onChange={(e) => setForm({ ...form, il_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Seçin</option>
                  {iller.map((il) => (
                    <option key={il.id} value={il.id}>{il.ad}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori *</label>
                <select
                  value={form.kategori_id}
                  onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Seçin</option>
                  {kategoriler.map((k) => (
                    <option key={k.id} value={k.id}>{k.ad}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input label="Adres" value={form.adres} onChange={(v) => setForm({ ...form, adres: v })} />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Firma Hakkında</label>
              <textarea
                value={form.hakkinda}
                onChange={(e) => setForm({ ...form, hakkinda: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Firmanızı kısaca tanıtın..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Web Sitesi" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://..." />
              <Input label="Vergi No" value={form.vergi_no} onChange={(v) => setForm({ ...form, vergi_no: v })} />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  if (!form.firma_adi || !form.yetkili_ad_soyad || !form.telefon || !form.email || !form.sifre || !form.il_id || !form.kategori_id) {
                    setHata('Zorunlu (*) alanları doldurun.');
                    return;
                  }
                  setHata('');
                  setAdim(2);
                }}
                className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600"
              >
                Devam →
              </button>
            </div>
          </div>
        )}

        {adim === 2 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg mb-2">Doğrulama Belgeleri</h3>
            <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              ⚠️ Güvenlik için her firmanın kimlik + selfie + vergi levhası yüklemesi zorunludur. Belgeler sadece admin tarafından kontrol edilir, sitede <strong>yayınlanmaz</strong>.
            </p>

            <DosyaYukle
              label="Kimlik Fotoğrafı (Ön Yüz) *"
              accept="image/*"
              dosya={dosyalar.kimlik}
              onChange={(f) => setDosyalar({ ...dosyalar, kimlik: f })}
            />
            <DosyaYukle
              label="Kimlikle Selfie *"
              aciklama="Kimliğinizi yüzünüzün yanında tutarak çekilmiş selfie"
              accept="image/*"
              dosya={dosyalar.selfie}
              onChange={(f) => setDosyalar({ ...dosyalar, selfie: f })}
            />
            <DosyaYukle
              label="Vergi Levhası *"
              aciklama="Firma adıyla uyumlu olmalı"
              accept="image/*,application/pdf"
              dosya={dosyalar.vergi}
              onChange={(f) => setDosyalar({ ...dosyalar, vergi: f })}
            />
            <DosyaYukle
              label="Firma Logosu (opsiyonel)"
              accept="image/*"
              dosya={dosyalar.logo}
              onChange={(f) => setDosyalar({ ...dosyalar, logo: f })}
            />

            <div className="flex justify-between pt-4">
              <button onClick={() => setAdim(1)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200">
                ← Geri
              </button>
              <button
                onClick={() => {
                  if (!dosyalar.kimlik || !dosyalar.selfie || !dosyalar.vergi) {
                    setHata('Kimlik, selfie ve vergi levhası zorunludur.');
                    return;
                  }
                  setHata('');
                  setAdim(3);
                }}
                className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600"
              >
                Devam →
              </button>
            </div>
          </div>
        )}

        {adim === 3 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg mb-2">Son Kontrol ve Onay</h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div><span className="font-semibold">Firma:</span> {form.firma_adi}</div>
              <div><span className="font-semibold">Yetkili:</span> {form.yetkili_ad_soyad}</div>
              <div><span className="font-semibold">Telefon:</span> {form.telefon}</div>
              <div><span className="font-semibold">E-posta:</span> {form.email}</div>
              <div><span className="font-semibold">İl:</span> {iller.find((i) => i.id === parseInt(form.il_id))?.ad}</div>
              <div><span className="font-semibold">Kategori:</span> {kategoriler.find((k) => k.id === parseInt(form.kategori_id))?.ad}</div>
              <div><span className="font-semibold">Belgeler:</span>
                {' '}
                {dosyalar.kimlik && '✓ Kimlik '}
                {dosyalar.selfie && '✓ Selfie '}
                {dosyalar.vergi && '✓ Vergi Levhası '}
                {dosyalar.logo && '✓ Logo'}
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.kvkk}
                onChange={(e) => setForm({ ...form, kvkk: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                <strong>KVKK Aydınlatma Metni</strong>, <strong>Üyelik Sözleşmesi</strong> ve <strong>Gizlilik Politikasını</strong> okudum, kabul ediyorum. Yüklediğim belgelerin gerçek olduğunu beyan ederim.
              </span>
            </label>

            <div className="flex justify-between pt-4">
              <button onClick={() => setAdim(2)} disabled={loading} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50">
                ← Geri
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.kvkk}
                className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Gönderiliyor...' : 'Kaydı Tamamla'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

function DosyaYukle({
  label,
  aciklama,
  accept,
  dosya,
  onChange,
}: {
  label: string;
  aciklama?: string;
  accept: string;
  dosya: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {aciklama && <p className="text-xs text-gray-500 mb-2">{aciklama}</p>}
      <label className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        dosya ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary-300 hover:bg-primary-50'
      }`}>
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
        />
        {dosya ? (
          <>
            <Check className="text-green-600" size={20} />
            <div className="flex-1 truncate text-sm">
              <div className="font-semibold text-green-700">{dosya.name}</div>
              <div className="text-xs text-green-600">{(dosya.size / 1024).toFixed(0)} KB</div>
            </div>
          </>
        ) : (
          <>
            <Upload className="text-gray-400" size={20} />
            <span className="text-sm text-gray-600">Dosya seç veya sürükle</span>
          </>
        )}
      </label>
    </div>
  );
}
