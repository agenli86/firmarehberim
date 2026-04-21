'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminDefterEkle({
  firmalar,
  iller,
}: {
  firmalar: { id: string; firma_adi: string }[];
  iller: { id: number; ad: string }[];
}) {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    firma_id: '',
    tip: 'yuk' as 'yuk' | 'bos_arac' | 'duyuru',
    mesaj: '',
    nereden_il_id: '',
    nereye_il_id: '',
  });

  const ekle = async () => {
    setMsg('');
    if (!form.firma_id) return setMsg('Firma seçin');
    if (!form.mesaj.trim()) return setMsg('Mesaj boş olamaz');

    setLoading(true);
    const res = await fetch('/api/admin/defter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firma_id: form.firma_id,
        tip: form.tip,
        mesaj: form.mesaj,
        nereden_il_id: form.nereden_il_id ? parseInt(form.nereden_il_id) : null,
        nereye_il_id: form.nereye_il_id ? parseInt(form.nereye_il_id) : null,
        onay_durum: 'onayli', // admin eklerse direkt onaylı
        onay_tarihi: new Date().toISOString(),
        aktif: true,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg('Mesaj eklendi ve yayında ✓');
      setForm({ ...form, mesaj: '', nereden_il_id: '', nereye_il_id: '' });
      router.refresh();
    } else {
      const err = await res.json();
      setMsg(err.error || 'Hata');
    }
  };

  return (
    <div className="admin-card">
      <button
        onClick={() => setAcik(!acik)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#111827', width: '100%', justifyContent: 'space-between' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} className="text-primary-500" /> Yönetici olarak defter mesajı ekle
        </span>
        {acik ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {acik && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          {msg && (
            <div style={{ padding: 10, background: msg.includes('✓') ? '#d1fae5' : '#fee2e2', color: msg.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
              {msg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280' }}>Firma *</label>
              <select className="admin-select" value={form.firma_id} onChange={(e) => setForm({ ...form, firma_id: e.target.value })}>
                <option value="">Firma seçin</option>
                {firmalar.map((f) => <option key={f.id} value={f.id}>{f.firma_adi}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280' }}>Tip</label>
              <select className="admin-select" value={form.tip} onChange={(e) => setForm({ ...form, tip: e.target.value as any })}>
                <option value="yuk">Yük/İş</option>
                <option value="bos_arac">Boş Araç</option>
                <option value="duyuru">Duyuru</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Mesaj *</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={form.mesaj}
              onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
              placeholder="Örn: İstanbul'dan Ankara'ya 3 sıra eşya bakılır..."
              maxLength={500}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280' }}>Nereden</label>
              <select className="admin-select" value={form.nereden_il_id} onChange={(e) => setForm({ ...form, nereden_il_id: e.target.value })}>
                <option value="">İl seç</option>
                {iller.map((il) => <option key={il.id} value={il.id}>{il.ad}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280' }}>Nereye</label>
              <select className="admin-select" value={form.nereye_il_id} onChange={(e) => setForm({ ...form, nereye_il_id: e.target.value })}>
                <option value="">İl seç</option>
                {iller.map((il) => <option key={il.id} value={il.id}>{il.ad}</option>)}
              </select>
            </div>
          </div>

          <button onClick={ekle} disabled={loading} className="admin-btn admin-btn-primary">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {loading ? 'Ekleniyor...' : 'Deftere Ekle (Direkt Yayınla)'}
          </button>
        </div>
      )}
    </div>
  );
}
