'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Loader2 } from 'lucide-react';
import RichEditor from '@/components/RichEditor';

type Il = {
  id: number; ad: string; slug: string; plaka: number; sira: number; aktif: boolean;
  seo_title: string | null; seo_description: string | null; seo_content: string | null;
};

export default function IllerEditor({ iller }: { iller: Il[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Il>>({});
  const [saving, setSaving] = useState(false);

  const basla = (il: Il) => {
    setEditId(il.id);
    setForm(il);
  };

  const kaydet = async () => {
    if (!editId) return;
    setSaving(true);
    await fetch(`/api/admin/iller/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditId(null);
    router.refresh();
  };

  if (editId) {
    return (
      <div className="admin-card" style={{ maxWidth: 700 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{form.ad} - Düzenle</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Plaka</label>
            <input className="admin-input" value={form.plaka || 0} onChange={(e) => setForm({ ...form, plaka: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Sıra</label>
            <input type="number" className="admin-input" value={form.sira || 0} onChange={(e) => setForm({ ...form, sira: parseInt(e.target.value) || 0 })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'end', paddingBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={form.aktif || false} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} />
              Aktif
            </label>
          </div>
        </div>

        <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Title</label>
        <input className="admin-input" value={form.seo_title || ''} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} style={{ marginBottom: 10 }} placeholder="Adana Nakliyat Firmaları..." />

        <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Description</label>
        <textarea className="admin-textarea" rows={2} value={form.seo_description || ''} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} style={{ marginBottom: 10 }} />

        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>SEO İçerik (firma listesinin altında görünür, gelişmiş editör)</label>
        <div style={{ marginBottom: 16 }}>
          <RichEditor
            value={form.seo_content || ''}
            onChange={(v) => setForm({ ...form, seo_content: v })}
            height={300}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={kaydet} disabled={saving} className="admin-btn admin-btn-primary">
            {saving && <Loader2 size={14} className="animate-spin" />} Kaydet
          </button>
          <button onClick={() => setEditId(null)} className="admin-btn admin-btn-ghost">İptal</button>
        </div>
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th style={{ width: 60 }}>Plaka</th>
          <th>İl</th>
          <th style={{ width: 80 }}>Sıra</th>
          <th style={{ width: 80 }}>Durum</th>
          <th style={{ width: 100 }}>İşlem</th>
        </tr>
      </thead>
      <tbody>
        {iller.map((il) => (
          <tr key={il.id}>
            <td style={{ fontFamily: 'monospace' }}>{String(il.plaka).padStart(2, '0')}</td>
            <td style={{ fontWeight: 600 }}>{il.ad}</td>
            <td>{il.sira}</td>
            <td>
              {il.aktif ? <span className="admin-badge admin-badge-green">Aktif</span> : <span className="admin-badge admin-badge-gray">Pasif</span>}
            </td>
            <td>
              <button onClick={() => basla(il)} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                <Edit size={14} /> Düzenle
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
