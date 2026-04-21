'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Upload, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import RichEditor from '@/components/RichEditor';

export default function BlogEditor({ yazi }: { yazi: any | null }) {
  const router = useRouter();
  const supabase = createClient();
  const isNew = !yazi;

  const [form, setForm] = useState({
    baslik: yazi?.baslik || '',
    slug: yazi?.slug || '',
    ozet: yazi?.ozet || '',
    icerik: yazi?.icerik || '',
    kapak_url: yazi?.kapak_url || '',
    yazar: yazi?.yazar || 'Admin',
    kategori: yazi?.kategori || '',
    etiketler: yazi?.etiketler || '',
    yayinda: yazi?.yayinda ?? true,
    one_cikan: yazi?.one_cikan || false,
    seo_title: yazi?.seo_title || '',
    seo_description: yazi?.seo_description || '',
    og_image: yazi?.og_image || '',
  });

  const [kapakFile, setKapakFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const upload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').upload(path, file);
    if (error) return null;
    const { data: urlData } = supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const kaydet = async () => {
    if (!form.baslik) return setMsg('Başlık zorunlu.');
    setSaving(true);
    setMsg('');

    let kapak = form.kapak_url;
    if (kapakFile) {
      const url = await upload(kapakFile);
      if (url) kapak = url;
    }

    const payload = {
      ...form,
      kapak_url: kapak,
      slug: form.slug || slugify(form.baslik),
    };

    const url = isNew ? '/api/admin/blog' : `/api/admin/blog/${yazi.id}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (res.ok) {
      if (isNew) {
        const data = await res.json();
        router.push(`/admin/blog/${data.id}`);
      } else {
        setMsg('Kaydedildi ✓');
        router.refresh();
      }
    } else {
      const err = await res.json();
      setMsg(err.error || 'Hata');
    }
  };

  const sil = async () => {
    if (!yazi || !confirm('Yazı kalıcı olarak silinecek. Emin misin?')) return;
    await fetch(`/api/admin/blog/${yazi.id}`, { method: 'DELETE' });
    router.push('/admin/blog');
  };

  return (
    <div className="admin-card" style={{ maxWidth: 1000 }}>
      {msg && (
        <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Başlık *</label>
          <input className="admin-input" value={form.baslik} onChange={(e) => {
            const baslik = e.target.value;
            setForm({ ...form, baslik, slug: isNew ? slugify(baslik) : form.slug });
          }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>URL (slug)</label>
          <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="yazi-basligi" />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#6b7280' }}>Özet (liste kartında görünür)</label>
        <textarea className="admin-textarea" rows={2} value={form.ozet} onChange={(e) => setForm({ ...form, ozet: e.target.value })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
          İçerik (zengin editör)
        </label>
        <RichEditor
          value={form.icerik}
          onChange={(v) => setForm({ ...form, icerik: v })}
          height={500}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#6b7280' }}>Kapak Görseli</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: '2px dashed #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
          <input type="file" accept="image/*" onChange={(e) => setKapakFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          <Upload size={16} />
          <span style={{ fontSize: 13 }}>{kapakFile ? kapakFile.name : form.kapak_url ? 'Değiştir' : 'Kapak yükle'}</span>
        </label>
        {form.kapak_url && !kapakFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.kapak_url} alt="" style={{ marginTop: 8, maxHeight: 120, borderRadius: 6 }} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Yazar</label>
          <input className="admin-input" value={form.yazar} onChange={(e) => setForm({ ...form, yazar: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Kategori</label>
          <input className="admin-input" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} placeholder="Rehber, Fiyat, Haberler..." />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280' }}>Etiketler (virgül)</label>
          <input className="admin-input" value={form.etiketler} onChange={(e) => setForm({ ...form, etiketler: e.target.value })} placeholder="nakliyat, istanbul, evden eve" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.yayinda} onChange={(e) => setForm({ ...form, yayinda: e.target.checked })} />
          Yayında
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.one_cikan} onChange={(e) => setForm({ ...form, one_cikan: e.target.checked })} />
          Öne Çıkan
        </label>
      </div>

      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #e5e7eb' }}>SEO Ayarları</h4>

      <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Title</label>
      <input className="admin-input" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} maxLength={70} style={{ marginBottom: 10 }} />

      <label style={{ fontSize: 12, color: '#6b7280' }}>SEO Description</label>
      <textarea className="admin-textarea" rows={2} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} maxLength={160} style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={kaydet} disabled={saving || !form.baslik} className="admin-btn admin-btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isNew ? 'Kaydet ve Düzenlemeye Devam' : 'Kaydet'}
        </button>
        {yazi && (
          <button onClick={sil} className="admin-btn admin-btn-danger" style={{ marginLeft: 'auto' }}>
            <Trash2 size={14} /> Sil
          </button>
        )}
      </div>
    </div>
  );
}
