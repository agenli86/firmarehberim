'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Trash2, Check } from 'lucide-react';

export default function IletisimListesi({ mesajlar }: { mesajlar: any[] }) {
  const router = useRouter();
  const [filtre, setFiltre] = useState<'hepsi' | 'okunmayan'>('okunmayan');

  const filtreli = mesajlar.filter((m) => filtre === 'hepsi' ? true : !m.okundu);
  const okunmayanSayi = mesajlar.filter((m) => !m.okundu).length;

  const okundu = async (id: number) => {
    await fetch(`/api/admin/iletisim/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ okundu: true }),
    });
    router.refresh();
  };

  const sil = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    await fetch(`/api/admin/iletisim/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFiltre('okunmayan')} className={`admin-btn ${filtre === 'okunmayan' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}>
            Okunmayan ({okunmayanSayi})
          </button>
          <button onClick={() => setFiltre('hepsi')} className={`admin-btn ${filtre === 'hepsi' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}>
            Hepsi
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtreli.length > 0 ? filtreli.map((m) => (
          <div key={m.id} className="admin-card" style={{ padding: 16, borderLeft: m.okundu ? '3px solid #d1d5db' : '3px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                  {m.ad_soyad}
                  {!m.okundu && <span className="admin-badge admin-badge-amber" style={{ marginLeft: 8 }}>Yeni</span>}
                </div>
                {m.konu && <div style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>Konu: {m.konu}</div>}
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280', marginBottom: 8, flexWrap: 'wrap' }}>
                  {m.email && <a href={`mailto:${m.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {m.email}</a>}
                  {m.telefon && <a href={`tel:${m.telefon}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {m.telefon}</a>}
                </div>
                <p style={{ fontSize: 13, color: '#374151', padding: 10, background: '#f9fafb', borderRadius: 4, whiteSpace: 'pre-wrap' }}>
                  {m.mesaj}
                </p>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                {new Date(m.created_at).toLocaleString('tr-TR')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {!m.okundu && (
                <button onClick={() => okundu(m.id)} className="admin-btn admin-btn-success" style={{ padding: '4px 10px', fontSize: 12 }}>
                  <Check size={12} /> Okundu İşaretle
                </button>
              )}
              <button onClick={() => sil(m.id)} className="admin-btn admin-btn-danger" style={{ padding: '4px 10px', fontSize: 12, marginLeft: 'auto' }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )) : (
          <div className="admin-card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            Mesaj yok.
          </div>
        )}
      </div>
    </>
  );
}
