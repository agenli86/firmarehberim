'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import { zamanOnce } from '@/lib/utils';

export default function DefterModerasyon({ mesajlar: initialMesajlar }: { mesajlar: any[] }) {
  const router = useRouter();
  const [mesajlar, setMesajlar] = useState(initialMesajlar);
  const [filtre, setFiltre] = useState<'beklemede' | 'onayli' | 'reddedildi' | 'hepsi' | 'silindi'>('beklemede');
  const [redInput, setRedInput] = useState<{ id: number; sebep: string } | null>(null);
  const [msg, setMsg] = useState('');
  const [islemYapilan, setIslemYapilan] = useState<number | null>(null);

  // Props değişince state'i güncelle (refresh sonrası)
  useEffect(() => {
    setMesajlar(initialMesajlar);
  }, [initialMesajlar]);

  const filtreli = mesajlar.filter((m) => {
    if (filtre === 'hepsi') return !m.silindi;
    if (filtre === 'silindi') return m.silindi;
    return m.onay_durum === filtre && !m.silindi;
  });

  const bekleyenSayi = mesajlar.filter((m) => m.onay_durum === 'beklemede' && !m.silindi).length;

  const islem = async (id: number, body: any) => {
    setMsg('');
    setIslemYapilan(id);
    try {
      let url = `/api/admin/defter/${id}`;
      let method = 'PATCH';
      let jsonBody: string | undefined = JSON.stringify(body);

      if (body.action === 'sil') {
        method = 'DELETE';
        jsonBody = undefined;
      } else if (body.action === 'hard_sil') {
        method = 'DELETE';
        jsonBody = undefined;
        url += '?hard=true';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody,
      });
      if (!res.ok) {
        const err = await res.json();
        setMsg(`Hata: ${err.error || 'İşlem yapılamadı'}`);
      } else {
        // Optimistic UI: local state'i hemen güncelle
        if (body.action === 'hard_sil') {
          setMesajlar((prev) => prev.filter((m) => m.id !== id));
        } else if (body.action === 'sil') {
          setMesajlar((prev) => prev.map((m) => m.id === id ? { ...m, silindi: true } : m));
        } else {
          setMesajlar((prev) => prev.map((m) => m.id === id ? { ...m, ...body } : m));
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
            { k: 'beklemede', l: `Bekleyen${bekleyenSayi > 0 ? ` (${bekleyenSayi})` : ''}` },
            { k: 'onayli', l: 'Onaylı' },
            { k: 'reddedildi', l: 'Reddedilen' },
            { k: 'hepsi', l: 'Hepsi' },
            { k: 'silindi', l: 'Silinenler' },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFiltre(f.k as any)}
              className={`admin-btn ${filtre === f.k ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 12, border: '1px solid', borderColor: msg.includes('✓') ? '#a7f3d0' : '#fecaca' }}>
          {msg}
        </div>
      )}

      {filtre === 'beklemede' && bekleyenSayi > 0 && (
        <div style={{ padding: 12, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#92400e' }}>
          ⏳ <strong>{bekleyenSayi}</strong> mesaj onay bekliyor. Onayladığın anda sitede yayınlanır.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtreli.length > 0 ? filtreli.map((m) => (
          <div key={m.id} className="admin-card" style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <Link href={`/firma/${m.firmalar?.slug}`} target="_blank" style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                  {m.firmalar?.firma_adi || '—'}
                </Link>
                <span className={`admin-badge admin-badge-${m.tip === 'yuk' ? 'amber' : m.tip === 'bos_arac' ? 'blue' : 'gray'}`}>
                  {m.tip === 'yuk' ? 'Yük/İş' : m.tip === 'bos_arac' ? 'Boş Araç' : 'Duyuru'}
                </span>
                <span className={`admin-badge admin-badge-${
                  m.onay_durum === 'onayli' ? 'green' :
                  m.onay_durum === 'reddedildi' ? 'red' : 'amber'
                }`}>
                  {m.onay_durum === 'onayli' ? 'Onaylı' : m.onay_durum === 'reddedildi' ? 'Reddedildi' : 'Bekliyor'}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{zamanOnce(m.created_at)}</span>
              </div>
              <p style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>{m.mesaj}</p>
              {(m.nereden?.ad || m.nereden_text) && (
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  📍 {m.nereden?.ad || m.nereden_text} → {m.nereye?.ad || m.nereye_text || '—'}
                </div>
              )}
              {m.red_sebebi && (
                <div style={{ fontSize: 12, color: '#991b1b', marginTop: 6, padding: 6, background: '#fee2e2', borderRadius: 4 }}>
                  Red sebebi: {m.red_sebebi}
                </div>
              )}
            </div>

            {redInput?.id === m.id ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="admin-input"
                  placeholder="Red sebebi (firmaya görünecek)"
                  value={redInput.sebep}
                  onChange={(e) => setRedInput({ ...redInput, sebep: e.target.value })}
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (!redInput.sebep) return;
                    islem(m.id, { onay_durum: 'reddedildi', red_sebebi: redInput.sebep });
                    setRedInput(null);
                  }}
                  className="admin-btn admin-btn-danger"
                >
                  Reddet
                </button>
                <button onClick={() => setRedInput(null)} className="admin-btn admin-btn-ghost">İptal</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {m.onay_durum !== 'onayli' && (
                  <button
                    onClick={() => islem(m.id, { onay_durum: 'onayli', onay_tarihi: new Date().toISOString() })}
                    disabled={islemYapilan === m.id}
                    className="admin-btn admin-btn-success"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    <Check size={14} /> {islemYapilan === m.id ? 'İşleniyor...' : 'Onayla'}
                  </button>
                )}
                {m.onay_durum !== 'reddedildi' && (
                  <button
                    onClick={() => setRedInput({ id: m.id, sebep: '' })}
                    disabled={islemYapilan === m.id}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    <X size={14} /> Reddet
                  </button>
                )}
                <button
                  onClick={() => islem(m.id, { aktif: !m.aktif })}
                  disabled={islemYapilan === m.id}
                  className="admin-btn admin-btn-ghost"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  {m.aktif ? <><EyeOff size={14} /> Gizle</> : <><Eye size={14} /> Aç</>}
                </button>
                {!m.silindi ? (
                  <button
                    onClick={() => { if (confirm('Bu mesaj silinecek (geri alınabilir). Emin misin?')) islem(m.id, { action: 'sil' }); }}
                    disabled={islemYapilan === m.id}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: '6px 12px', fontSize: 12, marginLeft: 'auto' }}
                    title="Silindi işaretle (geri alınabilir)"
                  >
                    <Trash2 size={14} /> Sil
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => islem(m.id, { silindi: false })}
                      disabled={islemYapilan === m.id}
                      className="admin-btn admin-btn-success"
                      style={{ padding: '6px 12px', fontSize: 12, marginLeft: 'auto' }}
                    >
                      Geri Al
                    </button>
                    <button
                      onClick={() => { if (confirm('Mesaj KALICI olarak silinecek, geri alınamaz. Devam?')) islem(m.id, { action: 'hard_sil' }); }}
                      disabled={islemYapilan === m.id}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      title="Kalıcı sil"
                    >
                      <Trash2 size={14} /> Kalıcı Sil
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="admin-card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            Bu filtrede mesaj yok.
          </div>
        )}
      </div>
    </>
  );
}
