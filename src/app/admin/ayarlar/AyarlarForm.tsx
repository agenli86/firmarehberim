'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ÖNEMLİ: Bu componentler dışarıda — her render'da yeniden tanımlanmıyor,
// bu sayede input focus kaybolmuyor.
function Tab({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="admin-card" open style={{ marginBottom: 12 }}>
      <summary style={{ fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 12 }}>{label}</summary>
      {children}
    </details>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

export default function AyarlarForm({ settings }: { settings: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const upload = async (file: File, klasor: string) => {
    const ext = file.name.split('.').pop();
    const path = `ayarlar/${klasor}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').upload(path, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const kaydet = async () => {
    setSaving(true);
    setMsg('');
    let payload = { ...form };

    if (logoFile) {
      const url = await upload(logoFile, 'logo');
      if (url) payload.logo_url = url;
    }
    if (faviconFile) {
      const url = await upload(faviconFile, 'favicon');
      if (url) payload.favicon_url = url;
    }

    const res = await fetch('/api/admin/ayarlar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      setMsg('Kaydedildi ✓');
      setLogoFile(null);
      setFaviconFile(null);
      router.refresh();
    } else {
      setMsg('Hata oluştu');
    }
  };

  return (
    <>
      {msg && (
        <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
          {msg}
        </div>
      )}

      <Tab label="Genel Bilgiler">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Row label="Site Adı">
            <input className="admin-input" value={form.site_adi || ''} onChange={(e) => setForm({ ...form, site_adi: e.target.value })} />
          </Row>
          <Row label="Slogan">
            <input className="admin-input" value={form.site_slogan || ''} onChange={(e) => setForm({ ...form, site_slogan: e.target.value })} />
          </Row>
        </div>

        <Row label="Logo (dosya yükle)">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: '2px dashed #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            <Upload size={16} />
            <span style={{ fontSize: 13 }}>{logoFile ? logoFile.name : form.logo_url ? 'Logoyu değiştir' : 'Logo yükle'}</span>
          </label>
          {form.logo_url && !logoFile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="" style={{ marginTop: 8, maxHeight: 60, background: '#f9fafb', padding: 8, borderRadius: 6 }} />
          )}
          <p style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
            Logo yüklersen, aşağıdaki yazılar görünmez.
          </p>
        </Row>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Row label="Logo Yazısı - 1. Satır (Büyük)">
            <input className="admin-input" value={form.logo_yazi_1 || ''} onChange={(e) => setForm({ ...form, logo_yazi_1: e.target.value })} placeholder="NAKLİYAT" />
          </Row>
          <Row label="Logo Yazısı - 2. Satır (Küçük)">
            <input className="admin-input" value={form.logo_yazi_2 || ''} onChange={(e) => setForm({ ...form, logo_yazi_2: e.target.value })} placeholder="FIRMA REHBERİ" />
          </Row>
        </div>

        <Row label="Favicon (tarayıcı sekmesindeki ikon - 32x32 PNG/ICO)">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: '2px dashed #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
            <input type="file" accept="image/png,image/x-icon,image/svg+xml" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            <Upload size={16} />
            <span style={{ fontSize: 13 }}>{faviconFile ? faviconFile.name : form.favicon_url ? 'Faviconu değiştir' : 'Favicon yükle'}</span>
          </label>
          {form.favicon_url && !faviconFile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.favicon_url} alt="" style={{ marginTop: 8, width: 32, height: 32, background: '#f9fafb', padding: 4, borderRadius: 4 }} />
          )}
        </Row>

        <Row label="Topbar Metni (üst dar şerit)">
          <input className="admin-input" value={form.topbar_metin || ''} onChange={(e) => setForm({ ...form, topbar_metin: e.target.value })} placeholder="Örn: 7/24 Açık Destek: 0532..." />
        </Row>
      </Tab>

      <Tab label="Ana Sayfa Hero (Turuncu Üst Alan)">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', fontSize: 13 }}>
          <input type="checkbox" checked={form.hero_aktif ?? true} onChange={(e) => setForm({ ...form, hero_aktif: e.target.checked })} />
          Hero alanı görünsün
        </label>

        <Row label="Büyük Başlık">
          <input className="admin-input" value={form.hero_baslik || ''} onChange={(e) => setForm({ ...form, hero_baslik: e.target.value })} placeholder="Türkiye'nin Nakliyat Rehberi" />
        </Row>

        <Row label="Alt Yazı (açıklama)">
          <textarea className="admin-textarea" rows={2} value={form.hero_alt_yazi || ''} onChange={(e) => setForm({ ...form, hero_alt_yazi: e.target.value })} placeholder="Onaylı nakliyat firmaları, anlık yük ve boş araç ilanları..." />
        </Row>

        <div style={{ padding: 10, background: '#f9fafb', borderRadius: 6, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Buton 1 (Beyaz arka plan)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Row label="Yazı">
              <input className="admin-input" value={form.hero_btn1_yazi || ''} onChange={(e) => setForm({ ...form, hero_btn1_yazi: e.target.value })} placeholder="Defteri Gör" />
            </Row>
            <Row label="Link">
              <input className="admin-input" value={form.hero_btn1_link || ''} onChange={(e) => setForm({ ...form, hero_btn1_link: e.target.value })} placeholder="/defter veya https://..." />
            </Row>
          </div>
        </div>

        <div style={{ padding: 10, background: '#f9fafb', borderRadius: 6, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Buton 2 (Şeffaf arka plan)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Row label="Yazı">
              <input className="admin-input" value={form.hero_btn2_yazi || ''} onChange={(e) => setForm({ ...form, hero_btn2_yazi: e.target.value })} placeholder="Firma Kaydı" />
            </Row>
            <Row label="Link">
              <input className="admin-input" value={form.hero_btn2_link || ''} onChange={(e) => setForm({ ...form, hero_btn2_link: e.target.value })} placeholder="/kayit veya https://..." />
            </Row>
          </div>
        </div>

        <div style={{ padding: 10, background: '#f9fafb', borderRadius: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Alt Kısımdaki 3 Özellik Chip&apos;i (her biri için kısa yazı)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Row label="1. Özellik">
              <input className="admin-input" value={form.hero_ozellik1 || ''} onChange={(e) => setForm({ ...form, hero_ozellik1: e.target.value })} placeholder="Kimlik Onaylı Firmalar" />
            </Row>
            <Row label="2. Özellik">
              <input className="admin-input" value={form.hero_ozellik2 || ''} onChange={(e) => setForm({ ...form, hero_ozellik2: e.target.value })} placeholder="Anlık İlan Akışı" />
            </Row>
            <Row label="3. Özellik">
              <input className="admin-input" value={form.hero_ozellik3 || ''} onChange={(e) => setForm({ ...form, hero_ozellik3: e.target.value })} placeholder="Ücretsiz Kayıt" />
            </Row>
          </div>
          <p style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
            Boş bırakılan özellik gösterilmez.
          </p>
        </div>
      </Tab>

      <Tab label="İletişim">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Row label="Telefon">
            <input className="admin-input" value={form.telefon || ''} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
          </Row>
          <Row label="WhatsApp">
            <input className="admin-input" value={form.whatsapp || ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </Row>
          <Row label="E-posta">
            <input className="admin-input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Row>
          <Row label="Adres">
            <input className="admin-input" value={form.adres || ''} onChange={(e) => setForm({ ...form, adres: e.target.value })} />
          </Row>
        </div>
      </Tab>

      <Tab label="Sosyal Medya">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Row label="Facebook">
            <input className="admin-input" value={form.facebook || ''} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." />
          </Row>
          <Row label="Instagram">
            <input className="admin-input" value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </Row>
          <Row label="Twitter/X">
            <input className="admin-input" value={form.twitter || ''} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
          </Row>
          <Row label="YouTube">
            <input className="admin-input" value={form.youtube || ''} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
          </Row>
        </div>
      </Tab>

      <Tab label="SEO (Ana Sayfa Meta Etiketleri)">
        <Row label="SEO Title (Tarayıcı Sekmesi + Google)">
          <input className="admin-input" value={form.seo_title || ''} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} maxLength={70} />
          <small style={{ fontSize: 11, color: '#6b7280' }}>{(form.seo_title || '').length}/70 karakter</small>
        </Row>
        <Row label="SEO Description">
          <textarea className="admin-textarea" rows={2} value={form.seo_description || ''} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} maxLength={160} />
          <small style={{ fontSize: 11, color: '#6b7280' }}>{(form.seo_description || '').length}/160 karakter</small>
        </Row>
        <Row label="SEO Keywords (virgülle ayır)">
          <input className="admin-input" value={form.seo_keywords || ''} onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })} placeholder="nakliyat, evden eve, firma rehberi" />
        </Row>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Row label="Google Analytics ID">
            <input className="admin-input" value={form.google_analytics || ''} onChange={(e) => setForm({ ...form, google_analytics: e.target.value })} placeholder="G-XXXXX" />
          </Row>
          <Row label="Google Verification">
            <input className="admin-input" value={form.google_verification || ''} onChange={(e) => setForm({ ...form, google_verification: e.target.value })} />
          </Row>
          <Row label="Yandex Verification">
            <input className="admin-input" value={form.yandex_verification || ''} onChange={(e) => setForm({ ...form, yandex_verification: e.target.value })} />
          </Row>
          <Row label="OG Image URL (Sosyal medya paylaşım görseli)">
            <input className="admin-input" value={form.og_image || ''} onChange={(e) => setForm({ ...form, og_image: e.target.value })} />
          </Row>
        </div>
      </Tab>

      <Tab label="Site Durumu">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.kayit_acik || false} onChange={(e) => setForm({ ...form, kayit_acik: e.target.checked })} />
          Firma kayıtları açık
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.defter_acik || false} onChange={(e) => setForm({ ...form, defter_acik: e.target.checked })} />
          Defter aktif
        </label>
        <Row label="Footer Metni">
          <textarea className="admin-textarea" rows={2} value={form.footer_metin || ''} onChange={(e) => setForm({ ...form, footer_metin: e.target.value })} />
        </Row>
      </Tab>

      <div style={{ position: 'sticky', bottom: 0, background: '#f5f7fa', padding: '12px 0', marginTop: 20 }}>
        <button onClick={kaydet} disabled={saving} className="admin-btn admin-btn-primary" style={{ padding: '12px 24px' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
        </button>
      </div>
    </>
  );
}
