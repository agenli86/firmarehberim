'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function TalepEditor({ talepler }: { talepler: any[] }) {
  const router = useRouter();
  const [filtre, setFiltre] = useState<'hepsi' | 'okunmayan' | 'yeni'>('okunmayan');
  const [acik, setAcik] = useState<Record<number, boolean>>({});

  const filtreli = talepler.filter((t) => {
    if (filtre === 'hepsi') return true;
    if (filtre === 'okunmayan') return !t.okundu;
    if (filtre === 'yeni') return t.durum === 'yeni';
    return true;
  });

  const okundu = async (id: number) => {
    await fetch(`/api/admin/talepler/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ okundu: true, durum: 'incelendi' }),
    });
    router.refresh();
  };

  const sil = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    await fetch(`/api/admin/talepler/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { k: 'okunmayan', l: 'Okunmayan' },
            { k: 'yeni', l: 'Yeni' },
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
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtreli.length > 0 ? filtreli.map((t) => (
          <div key={t.id} className="admin-card" style={{ padding: 16, borderLeft: t.okundu ? '3px solid #d1d5db' : '3px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t.ad_soyad}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#4b5563', marginBottom: 8, flexWrap: 'wrap' }}>
                  <a href={`tel:${t.telefon}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={12} /> {t.telefon}
                  </a>
                  {t.email && (
                    <a href={`mailto:${t.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={12} /> {t.email}
                    </a>
                  )}
                  {!t.okundu && <span className="admin-badge admin-badge-amber">Yeni</span>}
                </div>

                {/* Nakliye rota bilgisi */}
                <div style={{ fontSize: 13, background: '#fef3c7', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                  📍 <strong>{t.nereden?.ad || '—'}</strong> → <strong>{t.nereye?.ad || '—'}</strong>
                  {t.kategoriler && <span style={{ marginLeft: 8 }}>• {t.kategoriler.ad}</span>}
                  {t.tarih && <span style={{ marginLeft: 8 }}>• {new Date(t.tarih).toLocaleDateString('tr-TR')}</span>}
                </div>

                {/* Detaylar (kapalı/açık) */}
                {(t.ev_tipi || t.cikis_kat !== null || t.oda_sayisi || t.aciklama) && (
                  <button
                    onClick={() => setAcik({ ...acik, [t.id]: !acik[t.id] })}
                    style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {acik[t.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {acik[t.id] ? 'Detayları gizle' : 'Tüm detayları göster'}
                  </button>
                )}

                {acik[t.id] && (
                  <div style={{ fontSize: 12, background: '#f9fafb', padding: 10, borderRadius: 4, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {t.ev_tipi && <div><strong>Ev Tipi:</strong> {t.ev_tipi}</div>}
                    {t.oda_sayisi && <div><strong>Oda Sayısı:</strong> {t.oda_sayisi}</div>}
                    {t.cikis_kat !== null && t.cikis_kat !== undefined && (
                      <div><strong>Çıkılan Kat:</strong> {t.cikis_kat}. {t.cikis_asansor ? '(Asansörlü)' : '(Asansörsüz)'}</div>
                    )}
                    {t.varis_kat !== null && t.varis_kat !== undefined && (
                      <div><strong>Varış Kat:</strong> {t.varis_kat}. {t.varis_asansor ? '(Asansörlü)' : '(Asansörsüz)'}</div>
                    )}
                    {t.esya_durumu && <div><strong>Eşya:</strong> {t.esya_durumu}</div>}
                    <div>
                      <strong>Ek Hizmetler:</strong>
                      {t.paketleme && ' 📦Paketleme'}
                      {t.sigorta && ' 🛡️Sigorta'}
                      {t.depolama && ' 🏢Depolama'}
                      {!t.paketleme && !t.sigorta && !t.depolama && ' Yok'}
                    </div>
                  </div>
                )}

                {t.aciklama && (
                  <p style={{ fontSize: 13, color: '#374151', padding: 8, background: '#f9fafb', borderRadius: 4, marginTop: 8 }}>
                    <strong>Açıklama:</strong> {t.aciklama}
                  </p>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                {new Date(t.created_at).toLocaleString('tr-TR')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {!t.okundu && (
                <button onClick={() => okundu(t.id)} className="admin-btn admin-btn-success" style={{ padding: '4px 10px', fontSize: 12 }}>
                  <Check size={12} /> Okundu
                </button>
              )}
              <button onClick={() => sil(t.id)} className="admin-btn admin-btn-danger" style={{ padding: '4px 10px', fontSize: 12, marginLeft: 'auto' }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )) : (
          <div className="admin-card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            Talep yok.
          </div>
        )}
      </div>
    </>
  );
}
