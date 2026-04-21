'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Reklam = {
  id: number;
  baslik: string;
  gorsel_url: string;
  link: string | null;
  pozisyon: string;
  sayfa: string;
  sira: number;
  aktif: boolean;
};

export default function ReklamEditor({ reklamlar }: { reklamlar: Reklam[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<Partial<Reklam>>({ pozisyon: 'sag', sayfa: 'hepsi', sira: 0, aktif: true });
  const [editId, setEditId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const yukle = async () => {
    if (!file) return form.gorsel_url || '';
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `reklam/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').upload(path, file);
    setUploading(false);
    if (error) return null;
    const { data: urlData } = supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const kaydet = async () => {
    if (!form.baslik) return setMsg('Başlık gerekli');
    let gorsel = form.gorsel_url;
    if (file) {
      const url = await yukle();
      if (!url) return setMsg('Görsel yüklenemedi');
      gorsel = url;
    }
    if (!gorsel && !editId) return setMsg('Görsel gerekli');

    const payload = { ...form, gorsel_url: gorsel };
    const res = await fetch(editId ? `/api/admin/reklamlar/${editId}` : '/api/admin/reklamlar', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setForm({ pozisyon: 'sag', sayfa: 'hepsi', sira: 0, aktif: true });
      setFile(null);
      setEditId(null);
      setMsg('Kaydedildi ✓');
      router.refresh();
    } else {
      setMsg('Hata oluştu');
    }
  };

  const sil = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    await fetch(`/api/admin/reklamlar/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const duzenle = (r: Reklam) => {
    setEditId(r.id);
    setForm(r);
    setFile(null);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Form */}
      <div className="admin-card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          {editId ? 'Reklam Düzenle' : 'Yeni Reklam Ekle'}
        </h3>
        {msg && <div style={{ padding: 8, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', borderRadius: 6, fontSize: 13, marginBottom: 10 }}>{msg}</div>}

        <label style={{ fontSize: 12, color: '#6b7280' }}>Başlık *</label>
        <input className="admin-input" value={form.baslik || ''} onChange={(e) => setForm({ ...form, baslik: e.target.value })} style={{ marginBottom: 10 }} />

        <label style={{ fontSize: 12, color: '#6b7280' }}>Link</label>
        <input className="admin-input" value={form.link || ''} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." style={{ marginBottom: 10 }} />

        <label style={{ fontSize: 12, color: '#6b7280' }}>Görsel</label>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: '2px dashed #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            <Upload size={16} />
            <span style={{ fontSize: 13 }}>{file ? file.name : form.gorsel_url ? 'Değiştirmek için seç' : 'Görsel seç'}</span>
          </label>
          {form.gorsel_url && !file && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.gorsel_url} alt="" style={{ width: '100%', marginTop: 8, maxHeight: 160, objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: 6 }} />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Pozisyon</label>
            <select className="admin-select" value={form.pozisyon || 'sag'} onChange={(e) => setForm({ ...form, pozisyon: e.target.value })}>
              <option value="sag">Sağ Sidebar</option>
              <option value="sol">Sol Sidebar</option>
              <option value="ust">Üst</option>
              <option value="alt">Alt</option>
              <option value="icerik">İçerik Arası</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Sayfa</label>
            <select className="admin-select" value={form.sayfa || 'hepsi'} onChange={(e) => setForm({ ...form, sayfa: e.target.value })}>
              <option value="hepsi">Tüm Sayfalar</option>
              <option value="anasayfa">Sadece Anasayfa</option>
              <option value="defter">Sadece Defter</option>
              <option value="firma">Firma Detay</option>
              <option value="firmalar">Firmalar</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
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

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={kaydet} disabled={uploading} className="admin-btn admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            {uploading && <Loader2 size={14} className="animate-spin" />}
            {editId ? 'Güncelle' : 'Ekle'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm({ pozisyon: 'sag', sayfa: 'hepsi', sira: 0, aktif: true }); setFile(null); }} className="admin-btn admin-btn-ghost">
              İptal
            </button>
          )}
        </div>
      </div>

      {/* Liste */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reklamlar.length > 0 ? reklamlar.map((r) => (
            <div key={r.id} className="admin-card" style={{ padding: 12, display: 'flex', gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.gorsel_url} alt={r.baslik} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, background: '#f3f4f6' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.baslik}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <span className="admin-badge admin-badge-blue">{r.pozisyon}</span>
                  <span className="admin-badge admin-badge-gray">{r.sayfa}</span>
                  {r.aktif ? <span className="admin-badge admin-badge-green">Aktif</span> : <span className="admin-badge admin-badge-red">Pasif</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => duzenle(r)} className="admin-btn admin-btn-ghost" style={{ padding: '4px 8px' }}><Edit size={14} /></button>
                <button onClick={() => sil(r.id)} className="admin-btn admin-btn-danger" style={{ padding: '4px 8px' }}><Trash2 size={14} /></button>
              </div>
            </div>
          )) : (
            <div className="admin-card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              Henüz reklam yok. Sol taraftan ekleyin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
