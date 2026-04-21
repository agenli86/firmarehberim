'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Pause, Star, Award, Loader2, Trash2, Edit, Save, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';

export default function FirmaOnayActions({
  firma,
  iller,
  ilceler,
  kategoriler,
}: {
  firma: any;
  iller: { id: number; ad: string }[];
  ilceler: { id: number; ad: string }[];
  kategoriler: { id: number; ad: string }[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [redSebep, setRedSebep] = useState('');
  const [msg, setMsg] = useState('');
  const [duzenleModu, setDuzenleModu] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    firma_adi: firma.firma_adi || '',
    slug: firma.slug || '',
    yetkili_ad_soyad: firma.yetkili_ad_soyad || '',
    telefon: firma.telefon || '',
    whatsapp: firma.whatsapp || '',
    whatsapp_mesaj: firma.whatsapp_mesaj || 'Merhaba, nakliyat konusunda bilgi almak istiyorum.',
    email: firma.email || '',
    website: firma.website || '',
    adres: firma.adres || '',
    hakkinda: firma.hakkinda || '',
    vergi_no: firma.vergi_no || '',
    il_id: firma.il_id || '',
    ilce_id: firma.ilce_id || '',
    kategori_id: firma.kategori_id || '',
    sira: firma.sira || 0,
    one_cikan: firma.one_cikan || false,
    premium: firma.premium || false,
    logo_url: firma.logo_url || '',
    harita_embed: firma.harita_embed || '',
    latitude: firma.latitude || '',
    longitude: firma.longitude || '',
  });

  const callApi = async (body: any) => {
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/admin/firmalar/${firma.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json();
      setMsg(err.error || 'Hata');
      return false;
    }
    setMsg('Kaydedildi ✓');
    router.refresh();
    return true;
  };

  const upload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `logo/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').upload(path, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const tumunuKaydet = async () => {
    setLoading(true);
    setMsg('');
    let logoUrl = form.logo_url;
    if (logoFile) {
      const url = await upload(logoFile);
      if (url) logoUrl = url;
    }

    const body = {
      ...form,
      logo_url: logoUrl,
      il_id: form.il_id || null,
      ilce_id: form.ilce_id || null,
      kategori_id: form.kategori_id || null,
      latitude: form.latitude || null,
      longitude: form.longitude || null,
    };

    const ok = await callApi(body);
    if (ok) {
      setDuzenleModu(false);
      setLogoFile(null);
    }
  };

  if (duzenleModu) {
    return (
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Firma Bilgilerini Düzenle</h3>
          <button onClick={() => setDuzenleModu(false)} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
            İptal
          </button>
        </div>

        {msg && (
          <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Firma Adı</label>
            <input className="admin-input" value={form.firma_adi} onChange={(e) => setForm({ ...form, firma_adi: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>URL (slug)</label>
            <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Yetkili</label>
            <input className="admin-input" value={form.yetkili_ad_soyad} onChange={(e) => setForm({ ...form, yetkili_ad_soyad: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Telefon</label>
            <input className="admin-input" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>WhatsApp</label>
            <input className="admin-input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>E-posta</label>
            <input className="admin-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Website</label>
            <input className="admin-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Adres</label>
            <input className="admin-input" value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Vergi No</label>
            <input className="admin-input" value={form.vergi_no} onChange={(e) => setForm({ ...form, vergi_no: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>İl</label>
            <select className="admin-select" value={form.il_id} onChange={(e) => setForm({ ...form, il_id: e.target.value, ilce_id: '' })}>
              <option value="">—</option>
              {iller.map((il) => <option key={il.id} value={il.id}>{il.ad}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>İlçe {ilceler.length === 0 && form.il_id ? '(bu il için ilçe yok)' : ''}</label>
            <select className="admin-select" value={form.ilce_id} onChange={(e) => setForm({ ...form, ilce_id: e.target.value })} disabled={ilceler.length === 0}>
              <option value="">—</option>
              {ilceler.map((i) => <option key={i.id} value={i.id}>{i.ad}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Kategori</label>
            <select className="admin-select" value={form.kategori_id} onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}>
              <option value="">—</option>
              {kategoriler.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>WhatsApp Önyazı Mesajı</label>
            <textarea className="admin-textarea" rows={2} value={form.whatsapp_mesaj} onChange={(e) => setForm({ ...form, whatsapp_mesaj: e.target.value })} placeholder="Merhaba, ... hakkında bilgi almak istiyorum." />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Google Maps Embed Kodu</label>
            <textarea className="admin-textarea" rows={3} value={form.harita_embed} onChange={(e) => setForm({ ...form, harita_embed: e.target.value })} placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>' style={{ fontFamily: 'monospace', fontSize: 11 }} />
            <small style={{ fontSize: 10, color: '#6b7280' }}>
              Google Maps → yer ara → Paylaş → Harita yerleştir → HTML kopyala
            </small>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Hakkında</label>
            <textarea className="admin-textarea" rows={4} value={form.hakkinda} onChange={(e) => setForm({ ...form, hakkinda: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#6b7280' }}>Logo</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8, border: '2px dashed #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              <Upload size={14} />
              <span>{logoFile ? logoFile.name : form.logo_url ? 'Değiştir' : 'Logo seç'}</span>
            </label>
            {form.logo_url && !logoFile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo_url} alt="" style={{ marginTop: 6, maxHeight: 60, borderRadius: 4 }} />
            )}
          </div>

          <button onClick={tumunuKaydet} disabled={loading} className="admin-btn admin-btn-primary" style={{ marginTop: 8 }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Tümünü Kaydet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {msg && (
        <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13 }}>
          {msg}
        </div>
      )}

      {/* Düzenle butonu */}
      <button onClick={() => setDuzenleModu(true)} className="admin-btn admin-btn-primary" style={{ justifyContent: 'center' }}>
        <Edit size={16} /> Firma Bilgilerini Düzenle
      </button>

      {/* Onay / Red */}
      <div className="admin-card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Durum Yönetimi</h3>

        {firma.durum !== 'onayli' && (
          <button
            onClick={() => callApi({ durum: 'onayli', onay_tarihi: new Date().toISOString() })}
            disabled={loading}
            className="admin-btn admin-btn-success"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
          >
            <Check size={16} /> ONAYLA
          </button>
        )}

        {firma.durum !== 'reddedildi' && (
          <>
            <textarea
              placeholder="Red sebebi (firmaya gösterilecek)"
              value={redSebep}
              onChange={(e) => setRedSebep(e.target.value)}
              rows={2}
              className="admin-textarea"
              style={{ marginBottom: 6, fontSize: 12 }}
            />
            <button
              onClick={() => callApi({ durum: 'reddedildi', red_sebebi: redSebep })}
              disabled={loading || !redSebep}
              className="admin-btn admin-btn-danger"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
            >
              <X size={16} /> REDDET
            </button>
          </>
        )}

        {firma.durum !== 'askida' && (
          <button
            onClick={() => callApi({ durum: 'askida' })}
            disabled={loading}
            className="admin-btn admin-btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Pause size={16} /> Askıya Al
          </button>
        )}
      </div>

      {/* Sıralama + premium */}
      <div className="admin-card">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Sıralama</h3>

        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
          Sıra (büyük olan üstte)
        </label>
        <input
          type="number"
          defaultValue={firma.sira}
          onBlur={(e) => callApi({ sira: parseInt(e.target.value) || 0 })}
          className="admin-input"
          style={{ marginBottom: 10 }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            defaultChecked={firma.one_cikan}
            onChange={(e) => callApi({ one_cikan: e.target.checked })}
          />
          <Star size={14} /> Öne Çıkan
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            defaultChecked={firma.premium}
            onChange={(e) => callApi({ premium: e.target.checked })}
          />
          <Award size={14} /> Premium
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '8px 10px', background: '#fef3c7', borderRadius: 6, border: '1px solid #fde68a' }}>
          <input
            type="checkbox"
            defaultChecked={firma.ana_sayfa_premium}
            onChange={(e) => callApi({ ana_sayfa_premium: e.target.checked })}
          />
          <Star size={14} style={{ color: '#d97706' }} />
          <span style={{ fontWeight: 600 }}>Ana Sayfa Premium</span>
          <span style={{ fontSize: 11, color: '#92400e' }}>(Ana sayfada gösterilir)</span>
        </label>
      </div>

      {/* Silme */}
      <div className="admin-card" style={{ border: '1px solid #fee2e2' }}>
        <button
          onClick={async () => {
            if (!confirm('Firma kalıcı olarak silinecek. Emin misiniz?')) return;
            setLoading(true);
            const res = await fetch(`/api/admin/firmalar/${firma.id}`, { method: 'DELETE' });
            setLoading(false);
            if (res.ok) router.push('/admin/firmalar');
            else setMsg('Silinemedi');
          }}
          disabled={loading}
          className="admin-btn admin-btn-danger"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Trash2 size={14} /> Firmayı Sil
        </button>
      </div>
    </div>
  );
}
