'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Star, MessageSquare, Trash2, Loader2 } from 'lucide-react';

type Yorum = {
  id: number;
  firma_id: string;
  ad_soyad: string;
  email: string | null;
  yorum: string;
  puan: number;
  onaylandi: boolean;
  admin_cevap: string | null;
  created_at: string;
};

export default function FirmaYorumAdmin({
  firmaId,
  yorumlar: initialYorumlar,
}: {
  firmaId: string;
  yorumlar: Yorum[];
}) {
  const router = useRouter();
  const [yorumlar, setYorumlar] = useState(initialYorumlar);
  const [cevapEdit, setCevapEdit] = useState<{ id: number; cevap: string } | null>(null);
  const [islemYapilan, setIslemYapilan] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { setYorumlar(initialYorumlar); }, [initialYorumlar]);

  const islem = async (id: number, body: any, sil = false) => {
    setIslemYapilan(id);
    setMsg('');
    try {
      const res = await fetch(`/api/admin/firma-yorum/${id}`, {
        method: sil ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: sil ? undefined : JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        setMsg(`Hata: ${err.error}`);
      } else {
        // Optimistic UI
        if (sil) {
          setYorumlar((prev) => prev.filter((y) => y.id !== id));
        } else {
          setYorumlar((prev) => prev.map((y) => y.id === id ? { ...y, ...body } : y));
        }
        setMsg('İşlem başarılı ✓');
        router.refresh();
      }
    } catch (e: any) {
      setMsg(`Hata: ${e.message}`);
    } finally {
      setIslemYapilan(null);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const bekleyenSayi = yorumlar.filter((y) => !y.onaylandi).length;

  return (
    <div className="admin-card">
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <MessageSquare size={16} /> Müşteri Yorumları ({yorumlar.length})
        {bekleyenSayi > 0 && (
          <span className="admin-badge admin-badge-amber">{bekleyenSayi} bekleyen</span>
        )}
      </h3>

      {msg && (
        <div style={{ padding: 8, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 12, marginBottom: 10 }}>
          {msg}
        </div>
      )}

      {yorumlar.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {yorumlar.map((y) => (
            <div
              key={y.id}
              style={{
                padding: 12,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                borderLeft: y.onaylandi ? '3px solid #10b981' : '3px solid #f59e0b',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {y.ad_soyad}
                    {!y.onaylandi && <span className="admin-badge admin-badge-amber" style={{ marginLeft: 8 }}>Bekliyor</span>}
                    {y.onaylandi && <span className="admin-badge admin-badge-green" style={{ marginLeft: 8 }}>Yayında</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} style={{ color: i <= y.puan ? '#fbbf24' : '#d1d5db', fill: i <= y.puan ? '#fbbf24' : 'none' }} />
                    ))}
                  </div>
                  {y.email && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{y.email}</div>}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                  {new Date(y.created_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>{y.yorum}</p>

              {y.admin_cevap && cevapEdit?.id !== y.id && (
                <div style={{ padding: 8, background: '#fef3c7', borderRadius: 4, fontSize: 12, marginBottom: 8 }}>
                  <strong>Cevap:</strong> {y.admin_cevap}
                </div>
              )}

              {cevapEdit?.id === y.id && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <input
                    className="admin-input"
                    placeholder="Firma cevabı..."
                    value={cevapEdit.cevap}
                    onChange={(e) => setCevapEdit({ ...cevapEdit, cevap: e.target.value })}
                    autoFocus
                  />
                  <button
                    onClick={() => { islem(y.id, { admin_cevap: cevapEdit.cevap }); setCevapEdit(null); }}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                  >
                    Kaydet
                  </button>
                  <button onClick={() => setCevapEdit(null)} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>
                    İptal
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {!y.onaylandi && (
                  <button
                    onClick={() => islem(y.id, { onaylandi: true })}
                    disabled={islemYapilan === y.id}
                    className="admin-btn admin-btn-success"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                  >
                    {islemYapilan === y.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {islemYapilan === y.id ? 'İşleniyor...' : 'Onayla'}
                  </button>
                )}
                {y.onaylandi && (
                  <button
                    onClick={() => islem(y.id, { onaylandi: false })}
                    disabled={islemYapilan === y.id}
                    className="admin-btn admin-btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                  >
                    <X size={12} /> Yayından Kaldır
                  </button>
                )}
                <button
                  onClick={() => setCevapEdit({ id: y.id, cevap: y.admin_cevap || '' })}
                  className="admin-btn admin-btn-ghost"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                >
                  {y.admin_cevap ? 'Cevabı Düzenle' : 'Cevap Ver'}
                </button>
                <button
                  onClick={() => { if (confirm('Yorum silinsin mi?')) islem(y.id, {}, true); }}
                  disabled={islemYapilan === y.id}
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '4px 10px', fontSize: 12, marginLeft: 'auto' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13, background: '#f9fafb', borderRadius: 6 }}>
          Henüz yorum yok.
        </div>
      )}
    </div>
  );
}
