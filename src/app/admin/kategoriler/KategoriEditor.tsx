'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Plus, Trash2, Loader2 } from 'lucide-react';
import { slugify } from '@/lib/utils';
import RichEditor from '@/components/RichEditor';

type Kategori = {
  id: number; ad: string; slug: string; aciklama: string | null; ikon: string | null;
  sira: number; aktif: boolean; seo_title: string | null; seo_description: string | null;
  icerik: string | null;
};

// Otomatik default oluşturucular (kategori adından)
function guessTitle(ad: string): string {
  return ad ? `Türkiye Geneli ${ad} Firmaları - Onaylı Hizmet` : '';
}
function guessDesc(ad: string): string {
  return ad ? `${ad} hizmeti veren onaylı firmaları karşılaştır, en uygun teklifi al. Türkiye'nin tüm illerinden güvenilir nakliyeciler.` : '';
}
function guessAciklama(ad: string): string {
  return ad ? `${ad} kategorisinde hizmet veren firmalar.` : '';
}

export default function KategoriEditor({ kategoriler }: { kategoriler: Kategori[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Partial<Kategori>>({ aktif: true, sira: 0 });
  const [saving, setSaving] = useState(false);

  const basla = (k: Kategori) => {
    setEditId(k.id);
    setIsNew(false);
    setForm(k);
  };

  const yeni = () => {
    setEditId(null);
    setIsNew(true);
    setForm({ aktif: true, sira: 0 });
  };

  const kaydet = async () => {
    if (!form.ad) return;
    if (!form.slug) form.slug = slugify(form.ad);

    setSaving(true);
    const url = isNew ? '/api/admin/kategoriler' : `/api/admin/kategoriler/${editId}`;
    await fetch(url, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditId(null);
    setIsNew(false);
    setForm({ aktif: true, sira: 0 });
    router.refresh();
  };

  const sil = async (id: number) => {
    if (!confirm('Silinsin mi? İçindeki firmalar kategorisiz kalacak.')) return;
    await fetch(`/api/admin/kategoriler/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  if (editId || isNew) {
    return (
      <div className="admin-card" style={{ maxWidth: 600 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          {isNew ? 'Yeni Kategori' : `${form.ad} - Düzenle`}
        </h3>

        <label style={{ fontSize: 12, color: '#6b7280' }}>Kategori Adı *</label>
        <input className="admin-input" value={form.ad || ''} onChange={(e) => {
          const ad = e.target.value;
          // Yeni kayıt ise: slug + SEO + açıklama otomatik doldur (sadece boşsa)
          if (isNew) {
            const yeniForm: any = { ...form, ad };
            yeniForm.slug = slugify(ad);
            // Boş olanları otomatik doldur
            if (!form.seo_title || form.seo_title === guessTitle(form.ad)) {
              yeniForm.seo_title = guessTitle(ad);
            }
            if (!form.seo_description || form.seo_description === guessDesc(form.ad)) {
              yeniForm.seo_description = guessDesc(ad);
            }
            if (!form.aciklama || form.aciklama === guessAciklama(form.ad)) {
              yeniForm.aciklama = guessAciklama(ad);
            }
            setForm(yeniForm);
          } else {
            setForm({ ...form, ad });
          }
        }} style={{ marginBottom: 10 }} placeholder="Örn: Asansörlü Nakliyat" />

        <label style={{ fontSize: 12, color: '#6b7280' }}>URL (slug)</label>
        <input className="admin-input" value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ marginBottom: 10 }} />

        <label style={{ fontSize: 12, color: '#6b7280' }}>Açıklama</label>
        <textarea className="admin-textarea" rows={2} value={form.aciklama || ''} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} style={{ marginBottom: 10 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
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
        <input className="admin-input" value={form.seo_title || ''} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} style={{ marginBottom: 10 }} />

        <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Description</label>
        <textarea className="admin-textarea" rows={2} value={form.seo_description || ''} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} style={{ marginBottom: 16 }} />

        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
          İçerik (firma listesinin altında gösterilecek zengin metin)
        </label>
        <div style={{ marginBottom: 16 }}>
          <RichEditor
            value={form.icerik || ''}
            onChange={(v) => setForm({ ...form, icerik: v })}
            height={300}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={kaydet} disabled={saving || !form.ad} className="admin-btn admin-btn-primary">
            {saving && <Loader2 size={14} className="animate-spin" />} Kaydet
          </button>
          <button onClick={() => { setEditId(null); setIsNew(false); }} className="admin-btn admin-btn-ghost">İptal</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <button onClick={yeni} className="admin-btn admin-btn-primary">
          <Plus size={16} /> Yeni Kategori
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Slug</th>
            <th style={{ width: 60 }}>Sıra</th>
            <th style={{ width: 80 }}>Durum</th>
            <th style={{ width: 160 }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {kategoriler.map((k) => (
            <tr key={k.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{k.ad}</div>
                {k.aciklama && <div style={{ fontSize: 11, color: '#6b7280' }}>{k.aciklama}</div>}
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>/{k.slug}</td>
              <td>{k.sira}</td>
              <td>
                {k.aktif ? <span className="admin-badge admin-badge-green">Aktif</span> : <span className="admin-badge admin-badge-gray">Pasif</span>}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => basla(k)} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => sil(k.id)} className="admin-btn admin-btn-danger" style={{ padding: '4px 10px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
