'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ExternalLink } from 'lucide-react';
import RichEditor from '@/components/RichEditor';

type Il = { id: number; ad: string; slug: string };
type Kat = { id: number; ad: string; slug: string };

export default function IlKategoriSeoEditor({
  iller,
  kategoriler,
  secilenIl,
  secilenKategori,
  mevcutSeo,
}: {
  iller: Il[];
  kategoriler: Kat[];
  secilenIl: Il | undefined;
  secilenKategori: Kat | undefined;
  mevcutSeo: any;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    seo_title: mevcutSeo?.seo_title || '',
    seo_description: mevcutSeo?.seo_description || '',
    h1: mevcutSeo?.h1 || '',
    icerik: mevcutSeo?.icerik || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Seçim değişince formu yenile
  useEffect(() => {
    setForm({
      seo_title: mevcutSeo?.seo_title || '',
      seo_description: mevcutSeo?.seo_description || '',
      h1: mevcutSeo?.h1 || '',
      icerik: mevcutSeo?.icerik || '',
    });
  }, [mevcutSeo]);

  const ilDegistir = (slug: string) => {
    router.push(`/admin/il-kategori-seo?il=${slug}&kategori=${secilenKategori?.slug || ''}`);
  };
  const katDegistir = (slug: string) => {
    router.push(`/admin/il-kategori-seo?il=${secilenIl?.slug || ''}&kategori=${slug}`);
  };

  const kaydet = async () => {
    if (!secilenIl || !secilenKategori) return;
    setSaving(true);
    setMsg('');
    const res = await fetch('/api/admin/il-kategori-seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        il_id: secilenIl.id,
        kategori_id: secilenKategori.id,
        ...form,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg('Kaydedildi ✓');
      router.refresh();
    } else {
      const err = await res.json();
      setMsg(err.error || 'Hata');
    }
  };

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280' }}>İl Seç</label>
            <select className="admin-select" value={secilenIl?.slug || ''} onChange={(e) => ilDegistir(e.target.value)}>
              {iller.map((il) => <option key={il.id} value={il.slug}>{il.ad}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Kategori Seç</label>
            <select className="admin-select" value={secilenKategori?.slug || ''} onChange={(e) => katDegistir(e.target.value)}>
              {kategoriler.map((k) => <option key={k.id} value={k.slug}>{k.ad}</option>)}
            </select>
          </div>
        </div>
        {secilenIl && secilenKategori && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#374151' }}>
            <strong>Düzenleniyor:</strong> {secilenIl.ad} + {secilenKategori.ad}
            <a
              href={`/firmalar/${secilenIl.slug}/${secilenKategori.slug}`}
              target="_blank"
              rel="noopener"
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 10px', fontSize: 12, marginLeft: 'auto' }}
            >
              <ExternalLink size={12} /> Sayfayı Gör
            </a>
          </div>
        )}
      </div>

      {!secilenIl || !secilenKategori ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: 30, color: '#6b7280' }}>
          Önce il ve kategori seçin
        </div>
      ) : (
        <div className="admin-card">
          {msg && (
            <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
              {msg}
            </div>
          )}

          <label style={{ fontSize: 12, color: '#6b7280' }}>
            SEO Title (boş bırakırsan otomatik &quot;{secilenIl.ad} {secilenKategori.ad} Firmaları&quot;)
          </label>
          <input className="admin-input" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} maxLength={70} style={{ marginBottom: 4 }} />
          <small style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 12 }}>
            {form.seo_title.length}/70 karakter
          </small>

          <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Description</label>
          <textarea className="admin-textarea" rows={2} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} maxLength={160} style={{ marginBottom: 4 }} />
          <small style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 12 }}>
            {form.seo_description.length}/160 karakter
          </small>

          <label style={{ fontSize: 12, color: '#6b7280' }}>H1 Başlık (sayfanın ana başlığı, boş bırakırsan otomatik)</label>
          <input className="admin-input" value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} style={{ marginBottom: 16 }} />

          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
            İçerik (firma listesinin altında gösterilecek - {secilenIl.ad} {secilenKategori.ad} özel yazısı)
          </label>
          <div style={{ marginBottom: 16 }}>
            <RichEditor
              key={`${secilenIl.id}-${secilenKategori.id}`}
              value={form.icerik}
              onChange={(v) => setForm({ ...form, icerik: v })}
              height={400}
            />
          </div>

          <button onClick={kaydet} disabled={saving} className="admin-btn admin-btn-primary">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Kaydet
          </button>
        </div>
      )}
    </>
  );
}
