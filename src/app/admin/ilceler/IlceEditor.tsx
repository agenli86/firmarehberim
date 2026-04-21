'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Plus, Trash2, Loader2, X } from 'lucide-react';
import { slugify } from '@/lib/utils';
import RichEditor from '@/components/RichEditor';

type Il = { id: number; ad: string; slug: string };
type Ilce = {
  id: number; il_id: number; ad: string; slug: string; sira: number; aktif: boolean;
  seo_title: string | null; seo_description: string | null; seo_content: string | null;
};

export default function IlceEditor({
  iller,
  secilenIlSlug,
  secilenIl,
  ilceler,
}: {
  iller: Il[];
  secilenIlSlug: string;
  secilenIl: Il | undefined;
  ilceler: Ilce[];
}) {
  const router = useRouter();
  const [editId, setEditId] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Partial<Ilce>>({ aktif: true, sira: 0 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const basla = (i: Ilce) => {
    setEditId(i.id);
    setIsNew(false);
    setForm(i);
  };

  const yeni = () => {
    if (!secilenIl) return;
    setEditId(null);
    setIsNew(true);
    setForm({ aktif: true, sira: 0, il_id: secilenIl.id });
  };

  const kaydet = async () => {
    if (!form.ad || !secilenIl) return;
    if (!form.slug) form.slug = slugify(form.ad);

    setSaving(true);
    setMsg('');
    const url = isNew ? '/api/admin/ilceler' : `/api/admin/ilceler/${editId}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, il_id: secilenIl.id }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg('Kaydedildi ✓');
      setEditId(null);
      setIsNew(false);
      setForm({ aktif: true, sira: 0 });
      router.refresh();
    } else {
      const err = await res.json();
      setMsg(err.error || 'Hata');
    }
  };

  const sil = async (id: number) => {
    if (!confirm('İlçe silinsin mi? İçindeki firmalar ilçesiz kalacak.')) return;
    await fetch(`/api/admin/ilceler/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  if (editId || isNew) {
    return (
      <div className="admin-card" style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>
            {isNew ? `${secilenIl?.ad} için Yeni İlçe` : `${form.ad} - Düzenle`}
          </h3>
          <button onClick={() => { setEditId(null); setIsNew(false); }} className="admin-btn admin-btn-ghost">
            <X size={14} /> İptal
          </button>
        </div>

        {msg && <div style={{ padding: 8, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', borderRadius: 6, fontSize: 13, marginBottom: 10 }}>{msg}</div>}

        <label style={{ fontSize: 12, color: '#6b7280' }}>İlçe Adı *</label>
        <input className="admin-input" value={form.ad || ''} onChange={(e) => {
          const ad = e.target.value;
          if (isNew) {
            const yeniForm: any = { ...form, ad };
            yeniForm.slug = slugify(ad);
            const ilAdi = secilenIl?.ad || '';
            if (!form.seo_title) {
              yeniForm.seo_title = ad ? `${ilAdi} ${ad} Nakliyat Firmaları` : '';
            }
            if (!form.seo_description) {
              yeniForm.seo_description = ad ? `${ilAdi} ${ad} ilçesinde hizmet veren onaylı nakliyat firmaları, fiyat teklifleri ve iletişim bilgileri.` : '';
            }
            setForm(yeniForm);
          } else {
            setForm({ ...form, ad });
          }
        }} style={{ marginBottom: 10 }} placeholder="Örn: Sarıçam" />

        <label style={{ fontSize: 12, color: '#6b7280' }}>URL (slug)</label>
        <input className="admin-input" value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ marginBottom: 10 }} placeholder="seyhan" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Sıra</label>
            <input type="number" className="admin-input" value={form.sira || 0} onChange={(e) => setForm({ ...form, sira: parseInt(e.target.value) || 0 })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'end', paddingBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.aktif || false} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} />
              Aktif
            </label>
          </div>
        </div>

        <h4 style={{ fontSize: 13, fontWeight: 600, marginTop: 16, marginBottom: 8, color: '#6b7280' }}>SEO Ayarları</h4>

        <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Title</label>
        <input className="admin-input" value={form.seo_title || ''} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} style={{ marginBottom: 10 }} placeholder={`${secilenIl?.ad} ${form.ad || ''} Nakliyat Firmaları`} />

        <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Description</label>
        <textarea className="admin-textarea" rows={2} value={form.seo_description || ''} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} style={{ marginBottom: 10 }} />

        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>SEO İçerik (firma listesinin altında gösterilir)</label>
        <div style={{ marginBottom: 16 }}>
          <RichEditor
            value={form.seo_content || ''}
            onChange={(v) => setForm({ ...form, seo_content: v })}
            height={250}
          />
        </div>

        <button onClick={kaydet} disabled={saving || !form.ad} className="admin-btn admin-btn-primary">
          {saving && <Loader2 size={14} className="animate-spin" />} Kaydet
        </button>
      </div>
    );
  }

  return (
    <>
      {msg && <div style={{ padding: 8, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', borderRadius: 6, fontSize: 13, marginBottom: 10 }}>{msg}</div>}

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 6 }}>İl Seçin</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="admin-select"
            style={{ width: 260 }}
            value={secilenIlSlug}
            onChange={(e) => router.push(`/admin/ilceler?il=${e.target.value}`)}
          >
            {iller.map((il) => <option key={il.id} value={il.slug}>{il.ad}</option>)}
          </select>
          {secilenIl && (
            <button onClick={yeni} className="admin-btn admin-btn-primary">
              <Plus size={14} /> Yeni İlçe Ekle
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            {ilceler.length} ilçe
          </span>
        </div>
      </div>

      {ilceler.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Sıra</th>
              <th>İlçe</th>
              <th>Slug</th>
              <th style={{ width: 80 }}>Durum</th>
              <th style={{ width: 140 }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {ilceler.map((i) => (
              <tr key={i.id}>
                <td>{i.sira}</td>
                <td style={{ fontWeight: 600 }}>{i.ad}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>/{i.slug}</td>
                <td>
                  {i.aktif ? <span className="admin-badge admin-badge-green">Aktif</span> : <span className="admin-badge admin-badge-gray">Pasif</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => basla(i)} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                      <Edit size={12} />
                    </button>
                    <button onClick={() => sil(i.id)} className="admin-btn admin-btn-danger" style={{ padding: '4px 10px' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="admin-card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          {secilenIl?.ad} için henüz ilçe yok. &quot;Yeni İlçe Ekle&quot; ile ekle.
        </div>
      )}
    </>
  );
}
