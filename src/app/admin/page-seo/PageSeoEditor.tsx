'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Save, Loader2, X, ExternalLink } from 'lucide-react';

type PageSeo = {
  id: number;
  sayfa_key: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonical: string | null;
  og_image: string | null;
  h1: string | null;
  icerik: string | null;
};

const sayfaIsimleri: Record<string, { ad: string; url: string }> = {
  anasayfa: { ad: 'Ana Sayfa', url: '/' },
  defter: { ad: 'Defter', url: '/defter' },
  firmalar: { ad: 'Firmalar (İller Listesi)', url: '/firmalar' },
  kayit: { ad: 'Firma Kayıt', url: '/kayit' },
  giris: { ad: 'Firma Giriş', url: '/giris' },
  'teklif-al': { ad: 'Teklif Al', url: '/teklif-al' },
};

export default function PageSeoEditor({ sayfalar }: { sayfalar: PageSeo[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<PageSeo>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const basla = (p: PageSeo) => {
    setEditId(p.id);
    setForm(p);
  };

  const kaydet = async () => {
    setSaving(true);
    setMsg('');
    const res = await fetch(`/api/admin/page-seo/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        keywords: form.keywords,
        canonical: form.canonical,
        og_image: form.og_image,
        h1: form.h1,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg('Kaydedildi ✓');
      setEditId(null);
      router.refresh();
    } else {
      setMsg('Hata');
    }
  };

  if (editId) {
    const key = form.sayfa_key || '';
    const meta = sayfaIsimleri[key] || { ad: key, url: `/${key}` };

    return (
      <div className="admin-card" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{meta.ad} - SEO</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <a href={meta.url} target="_blank" rel="noopener" className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>
              <ExternalLink size={12} /> Sayfayı Gör
            </a>
            <button onClick={() => setEditId(null)} className="admin-btn admin-btn-ghost">
              <X size={14} /> İptal
            </button>
          </div>
        </div>

        {msg && <div style={{ padding: 8, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', borderRadius: 6, fontSize: 13, marginBottom: 10 }}>{msg}</div>}

        <label style={{ fontSize: 12, color: '#6b7280' }}>
          Meta Title (Tarayıcı sekmesinde ve Google arama sonuçlarında başlık olarak görünür)
        </label>
        <input className="admin-input" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={70} style={{ marginBottom: 4 }} />
        <small style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 12 }}>
          {(form.title || '').length}/70 karakter (ideal 50-60)
        </small>

        <label style={{ fontSize: 12, color: '#6b7280' }}>
          Meta Description (Google arama sonucunda başlığın altında çıkan açıklama)
        </label>
        <textarea className="admin-textarea" rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={160} style={{ marginBottom: 4 }} />
        <small style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 12 }}>
          {(form.description || '').length}/160 karakter (ideal 140-155)
        </small>

        <label style={{ fontSize: 12, color: '#6b7280' }}>Meta Keywords (virgülle ayır)</label>
        <input className="admin-input" value={form.keywords || ''} onChange={(e) => setForm({ ...form, keywords: e.target.value })} style={{ marginBottom: 12 }} placeholder="nakliyat, evden eve, firma rehberi, yük ilanı" />

        <label style={{ fontSize: 12, color: '#6b7280' }}>Canonical URL (duplicate content önlemek için)</label>
        <input className="admin-input" value={form.canonical || ''} onChange={(e) => setForm({ ...form, canonical: e.target.value })} style={{ marginBottom: 4 }} placeholder={`https://senindomainin.com${meta.url}`} />
        <small style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 12 }}>
          Boş bırakılırsa otomatik kendi URL&apos;i kullanılır
        </small>

        <label style={{ fontSize: 12, color: '#6b7280' }}>Open Graph Image URL (Sosyal medya paylaşım görseli)</label>
        <input className="admin-input" value={form.og_image || ''} onChange={(e) => setForm({ ...form, og_image: e.target.value })} style={{ marginBottom: 12 }} placeholder="https://.../og-image.jpg (1200x630 önerilir)" />

        <label style={{ fontSize: 12, color: '#6b7280' }}>H1 Başlık (Sayfanın ana başlığı)</label>
        <input className="admin-input" value={form.h1 || ''} onChange={(e) => setForm({ ...form, h1: e.target.value })} style={{ marginBottom: 16 }} />

        <button onClick={kaydet} disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Kaydet
        </button>
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Sayfa</th>
          <th>URL</th>
          <th>Title</th>
          <th>Description</th>
          <th style={{ width: 120 }}>İşlem</th>
        </tr>
      </thead>
      <tbody>
        {sayfalar.map((p) => {
          const meta = sayfaIsimleri[p.sayfa_key] || { ad: p.sayfa_key, url: `/${p.sayfa_key}` };
          return (
            <tr key={p.id}>
              <td style={{ fontWeight: 600 }}>{meta.ad}</td>
              <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{meta.url}</td>
              <td style={{ fontSize: 12, maxWidth: 240 }}>
                {p.title ? (
                  <span style={{ color: '#111827' }}>{p.title.slice(0, 50)}{p.title.length > 50 ? '...' : ''}</span>
                ) : (
                  <em style={{ color: '#9ca3af' }}>Varsayılan kullanılıyor</em>
                )}
              </td>
              <td style={{ fontSize: 12, maxWidth: 240 }}>
                {p.description ? (
                  <span style={{ color: '#111827' }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '...' : ''}</span>
                ) : (
                  <em style={{ color: '#9ca3af' }}>Varsayılan</em>
                )}
              </td>
              <td>
                <button onClick={() => basla(p)} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                  <Edit size={12} /> Düzenle
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
