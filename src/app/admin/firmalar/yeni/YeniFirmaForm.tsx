'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

export default function YeniFirmaForm({
  iller,
  kategoriler,
}: {
  iller: { id: number; ad: string }[];
  kategoriler: { id: number; ad: string }[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [ilceler, setIlceler] = useState<{ id: number; ad: string }[]>([]);

  const [form, setForm] = useState({
    firma_adi: '',
    slug: '',
    yetkili_ad_soyad: '',
    telefon: '',
    whatsapp: '',
    email: '',
    website: '',
    adres: '',
    hakkinda: '',
    vergi_no: '',
    il_id: '',
    ilce_id: '',
    kategori_id: '',
    durum: 'onayli' as 'onayli' | 'beklemede' | 'reddedildi' | 'askida',
    one_cikan: false,
    premium: false,
    sira: 0,
  });

  // İl seçildiğinde ilçeleri getir
  useEffect(() => {
    if (!form.il_id) {
      setIlceler([]);
      return;
    }
    supabase.from('ilceler').select('id, ad').eq('il_id', parseInt(form.il_id)).eq('aktif', true).order('sira').then(({ data }) => {
      setIlceler(data || []);
    });
  }, [form.il_id, supabase]);

  const upload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `logo/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').upload(path, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const kaydet = async () => {
    setMsg('');
    if (!form.firma_adi || !form.telefon || !form.email || !form.il_id || !form.kategori_id || !form.yetkili_ad_soyad) {
      return setMsg('Zorunlu alanları doldurun.');
    }

    setLoading(true);
    let logoUrl = null;
    if (logoFile) {
      logoUrl = await upload(logoFile);
      if (!logoUrl) {
        setLoading(false);
        return setMsg('Logo yüklenemedi');
      }
    }

    const slug = form.slug || `${slugify(form.firma_adi)}-${Math.random().toString(36).slice(2, 6)}`;

    const res = await fetch('/api/admin/firmalar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firma_adi: form.firma_adi,
        slug,
        yetkili_ad_soyad: form.yetkili_ad_soyad,
        telefon: form.telefon,
        whatsapp: form.whatsapp || form.telefon,
        email: form.email,
        website: form.website || null,
        adres: form.adres || null,
        hakkinda: form.hakkinda || null,
        vergi_no: form.vergi_no || null,
        il_id: parseInt(form.il_id),
        ilce_id: form.ilce_id ? parseInt(form.ilce_id) : null,
        kategori_id: parseInt(form.kategori_id),
        logo_url: logoUrl,
        durum: form.durum,
        one_cikan: form.one_cikan,
        premium: form.premium,
        sira: form.sira,
        onay_tarihi: form.durum === 'onayli' ? new Date().toISOString() : null,
      }),
    });

    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/firmalar/${data.id}`);
    } else {
      const err = await res.json();
      setMsg(err.error || 'Hata oluştu');
    }
  };

  return (
    <div className="admin-card" style={{ maxWidth: 900 }}>
      {msg && (
        <div style={{ padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
          {msg}
        </div>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
        Firma Bilgileri
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Firma Adı *</label>
          <input className="admin-input" value={form.firma_adi} onChange={(e) => setForm({ ...form, firma_adi: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>URL (slug) - boş bırakılırsa otomatik</label>
          <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="firma-adi-adana" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Yetkili Ad Soyad *</label>
          <input className="admin-input" value={form.yetkili_ad_soyad} onChange={(e) => setForm({ ...form, yetkili_ad_soyad: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Vergi No</label>
          <input className="admin-input" value={form.vergi_no} onChange={(e) => setForm({ ...form, vergi_no: e.target.value })} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Telefon *</label>
          <input className="admin-input" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} placeholder="0532..." />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>WhatsApp</label>
          <input className="admin-input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>E-posta *</label>
          <input type="email" className="admin-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>İl *</label>
          <select className="admin-select" value={form.il_id} onChange={(e) => setForm({ ...form, il_id: e.target.value, ilce_id: '' })}>
            <option value="">Seçin</option>
            {iller.map((il) => <option key={il.id} value={il.id}>{il.ad}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>İlçe {ilceler.length === 0 && form.il_id ? '(seçili il için ilçe yok)' : ''}</label>
          <select className="admin-select" value={form.ilce_id} onChange={(e) => setForm({ ...form, ilce_id: e.target.value })} disabled={ilceler.length === 0}>
            <option value="">—</option>
            {ilceler.map((i) => <option key={i.id} value={i.id}>{i.ad}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Kategori *</label>
          <select className="admin-select" value={form.kategori_id} onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}>
            <option value="">Seçin</option>
            {kategoriler.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#6b7280' }}>Adres</label>
        <input className="admin-input" value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#6b7280' }}>Website</label>
        <input className="admin-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#6b7280' }}>Hakkında</label>
        <textarea className="admin-textarea" rows={4} value={form.hakkinda} onChange={(e) => setForm({ ...form, hakkinda: e.target.value })} placeholder="Firma hakkında tanıtım metni..." />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#6b7280' }}>Logo</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: '2px dashed #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          <Upload size={16} />
          <span style={{ fontSize: 13 }}>{logoFile ? logoFile.name : 'Logo seç'}</span>
        </label>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
        Durum ve Sıralama
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Durum</label>
          <select className="admin-select" value={form.durum} onChange={(e) => setForm({ ...form, durum: e.target.value as any })}>
            <option value="onayli">Onaylı (sitede görünür)</option>
            <option value="beklemede">Beklemede</option>
            <option value="askida">Askıda</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Sıra (büyük = üstte)</label>
          <input type="number" className="admin-input" value={form.sira} onChange={(e) => setForm({ ...form, sira: parseInt(e.target.value) || 0 })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'end', paddingBottom: 4, gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.one_cikan} onChange={(e) => setForm({ ...form, one_cikan: e.target.checked })} />
            Öne Çıkan
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.checked })} />
            Premium
          </label>
        </div>
      </div>

      <button onClick={kaydet} disabled={loading} className="admin-btn admin-btn-primary" style={{ padding: '12px 24px', marginTop: 16 }}>
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Kaydediliyor...' : 'Firmayı Ekle'}
      </button>
    </div>
  );
}
