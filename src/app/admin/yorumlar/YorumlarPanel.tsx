'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Star, MessageSquare, Trash2, ExternalLink, Loader2 } from 'lucide-react';

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
  firmalar: { id: string; firma_adi: string; slug: string; telefon: string } | null;
};

export default function YorumlarPanel({ yorumlar: initialYorumlar }: { yorumlar: Yorum[] }) {
  const router = useRouter();
  const [yorumlar, setYorumlar] = useState(initialYorumlar);
  const [filtre, setFiltre] = useState<'bekleyen' | 'onayli' | 'hepsi'>('bekleyen');
  const [cevapEdit, setCevapEdit] = useState<{ id: number; cevap: string } | null>(null);
  const [islemYapilan, setIslemYapilan] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { setYorumlar(initialYorumlar); }, [initialYorumlar]);

  const filtreli = yorumlar.filter((y) => {
    if (filtre === 'bekleyen') return !y.onaylandi;
    if (filtre === 'onayli') return y.onaylandi;
    return true;
  });

  const bekleyenSayi = yorumlar.filter((y) => !y.onaylandi).length;

  const islem = async (id: number, body: any, sil = false) => {
    setMsg('');
    setIslemYapilan(id);
    try {
      const res = await fetch(`/api/admin/firma-yorum/${id}`, {
        method: sil ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: sil ? undefined : JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        setMsg(`Hata: ${err.error || 'İşlem yapılamadı'}`);
      } else {
        // Optimistic UI - hemen state'i güncelle
        if (sil) {
          setYorumlar((prev) => prev.filter((y) => y.id !== id));
        } else {
          setYorumlar((prev) => prev.map((y) => y.id === id ? { ...y, ...body } : y));
        }
        setMsg('İşlem başarılı ✓');
        router.refresh();
      }
    } catch (e: any) {
      setMsg(`Bağlantı hatası: ${e.message}`);
    } finally {
      setIslemYapilan(null);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { k: 'bekleyen', l: `Bekleyen${bekleyenSayi > 0 ? ` (${bekleyenSayi})` : ''}` },
            { k: 'onayli', l: 'Onaylı' },
            { k: 'hepsi', l: 'Hepsi' },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFiltre(f.k as any)}
              className={`admin-btn ${filtre === f.k ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            >
              {f.l}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280', alignSelf: 'center' }}>
            Toplam {yorumlar.length} yorum
          </span>
        </div>
      </div>

      {msg && (
        <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
          {msg}
        </div>
      )}

      {filtreli.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>
          {filtre === 'bekleyen' ? 'Bekleyen yorum yok 🎉' : 'Yorum bulunamadı'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtreli.map((y) => (
            <div
              key={y.id}
              className="admin-card"
              style={{
                borderLeft: y.onaylandi ? '4px solid #10b981' : '4px solid #f59e0b',
                padding: 14,
              }}
            >
              {/* Üst satır: firma + tarih */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                <div style={{ flex: 1 }}>
                  {y.firmalar ? (
                    <Link href={`/admin/firmalar/${y.firmalar.id}`} style={{ fontSize: 13, color: '#d97706', fontWeight: 600 }}>
                      → {y.firmalar.firma_adi}
                    </Link>
                  ) : (
                    <span style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>Firma silinmiş</span>
                  )}
                  {y.firmalar && (
                    <a
                      href={`/firma/${y.firmalar.slug}`}
                      target="_blank"
                      rel="noopener"
                      style={{ marginLeft: 8, fontSize: 11, color: '#6b7280', textDecoration: 'underline' }}
                    >
                      <ExternalLink size={10} style={{ display: 'inline' }} /> Sayfayı Gör
                    </a>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                  {new Date(y.created_at).toLocaleString('tr-TR')}
                </div>
              </div>

              {/* Müşteri bilgi + puan */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {y.ad_soyad}
                    {!y.onaylandi && <span className="admin-badge admin-badge-amber" style={{ marginLeft: 8 }}>Bekliyor</span>}
                    {y.onaylandi && <span className="admin-badge admin-badge-green" style={{ marginLeft: 8 }}>Yayında</span>}
                  </div>
                  {y.email && <div style={{ fontSize: 11, color: '#6b7280' }}>{y.email}</div>}
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      style={{
                        color: i <= y.puan ? '#fbbf24' : '#d1d5db',
                        fill: i <= y.puan ? '#fbbf24' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Yorum metni */}
              <p style={{ fontSize: 14, color: '#374151', marginBottom: 10, padding: 10, background: '#f9fafb', borderRadius: 6 }}>
                {y.yorum}
              </p>

              {y.admin_cevap && cevapEdit?.id !== y.id && (
                <div style={{ padding: 10, background: '#fef3c7', borderRadius: 6, fontSize: 13, marginBottom: 10, borderLeft: '3px solid #f59e0b' }}>
                  <strong>Firma cevabı:</strong> {y.admin_cevap}
                </div>
              )}

              {cevapEdit?.id === y.id && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <input
                    className="admin-input"
                    placeholder="Firma adına cevap..."
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

              {/* Butonlar */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {!y.onaylandi ? (
                  <button
                    onClick={() => islem(y.id, { onaylandi: true })}
                    disabled={islemYapilan === y.id}
                    className="admin-btn admin-btn-success"
                    style={{ padding: '6px 14px', fontSize: 13 }}
                  >
                    {islemYapilan === y.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {islemYapilan === y.id ? 'İşleniyor...' : 'Onayla & Yayınla'}
                  </button>
                ) : (
                  <button
                    onClick={() => islem(y.id, { onaylandi: false })}
                    disabled={islemYapilan === y.id}
                    className="admin-btn admin-btn-ghost"
                    style={{ padding: '6px 14px', fontSize: 13 }}
                  >
                    <X size={14} /> Yayından Kaldır
                  </button>
                )}
                <button
                  onClick={() => setCevapEdit({ id: y.id, cevap: y.admin_cevap || '' })}
                  className="admin-btn admin-btn-ghost"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                >
                  <MessageSquare size={14} /> {y.admin_cevap ? 'Cevabı Düzenle' : 'Cevap Ver'}
                </button>
                <button
                  onClick={() => { if (confirm('Yorum silinsin mi? Geri alınamaz.')) islem(y.id, {}, true); }}
                  disabled={islemYapilan === y.id}
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '6px 14px', fontSize: 13, marginLeft: 'auto' }}
                >
                  <Trash2 size={14} /> Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
