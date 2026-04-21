'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function FirmaGaleriAdmin({
  firmaId,
  galeri,
}: {
  firmaId: string;
  galeri: { id: number; gorsel_url: string; baslik: string | null; sira: number }[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [baslik, setBaslik] = useState('');

  const yukle = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `galeri/${firmaId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').upload(path, file);
    if (error) {
      setUploading(false);
      alert('Upload hatası: ' + error.message);
      return;
    }
    const { data: urlData } = supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET || 'img').getPublicUrl(data.path);

    // DB insert
    await fetch(`/api/admin/firma-galeri`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firma_id: firmaId,
        gorsel_url: urlData.publicUrl,
        baslik: baslik || null,
        sira: galeri.length,
      }),
    });
    setBaslik('');
    setUploading(false);
    router.refresh();
  };

  const sil = async (id: number) => {
    if (!confirm('Görsel silinsin mi?')) return;
    await fetch(`/api/admin/firma-galeri/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="admin-card">
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ImageIcon size={16} /> Firma Galerisi ({galeri.length})
      </h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input
          className="admin-input"
          placeholder="Başlık (opsiyonel)"
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          style={{ flex: 1 }}
        />
        <label className="admin-btn admin-btn-primary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) yukle(f); }}
          />
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
        </label>
      </div>

      {galeri.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {galeri.map((g) => (
            <div key={g.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.gorsel_url} alt={g.baslik || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
              <button
                onClick={() => sil(g.id)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                  border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer',
                }}
                title="Sil"
              >
                <Trash2 size={12} />
              </button>
              {g.baslik && (
                <div style={{ padding: 6, fontSize: 11, color: '#4b5563', background: '#f9fafb' }}>
                  {g.baslik}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13, background: '#f9fafb', borderRadius: 6 }}>
          Henüz galeri görseli yok.
        </div>
      )}
    </div>
  );
}
