'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import RichEditor from '@/components/RichEditor';

export default function SabitSayfaEditor({ sayfa }: { sayfa: any }) {
  const router = useRouter();
  const [form, setForm] = useState(sayfa);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const kaydet = async () => {
    setSaving(true);
    setMsg('');
    const res = await fetch(`/api/admin/sabit-sayfalar/${sayfa.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baslik: form.baslik,
        icerik: form.icerik,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        aktif: form.aktif,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg('Kaydedildi ✓');
      router.refresh();
    } else {
      setMsg('Hata oluştu');
    }
  };

  return (
    <div className="admin-card" style={{ maxWidth: 900 }}>
      {msg && (
        <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
          {msg}
        </div>
      )}

      <label style={{ fontSize: 12, color: '#6b7280' }}>URL</label>
      <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: 6, fontFamily: 'monospace', fontSize: 13, marginBottom: 12, color: '#6b7280' }}>
        /{sayfa.slug} <span style={{ fontSize: 11 }}>(değiştirilemez)</span>
      </div>

      <label style={{ fontSize: 12, color: '#6b7280' }}>Sayfa Başlığı</label>
      <input className="admin-input" value={form.baslik || ''} onChange={(e) => setForm({ ...form, baslik: e.target.value })} style={{ marginBottom: 12 }} />

      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
        İçerik (zengin editör - başlık, kalın, italik, link, liste, görsel)
      </label>
      <div style={{ marginBottom: 12 }}>
        <RichEditor
          value={form.icerik || ''}
          onChange={(v) => setForm({ ...form, icerik: v })}
          height={400}
        />
      </div>

      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #e5e7eb' }}>SEO Ayarları</h4>

      <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Title (tarayıcı sekmesinde görünen)</label>
      <input className="admin-input" value={form.seo_title || ''} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} style={{ marginBottom: 12 }} maxLength={70} />

      <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Description</label>
      <textarea className="admin-textarea" rows={2} value={form.seo_description || ''} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} style={{ marginBottom: 16 }} maxLength={160} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>
        <input type="checkbox" checked={form.aktif || false} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} />
        Sayfa aktif (pasif yaparsan 404 gösterir)
      </label>

      <button onClick={kaydet} disabled={saving} className="admin-btn admin-btn-primary" style={{ padding: '10px 20px' }}>
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  );
}
