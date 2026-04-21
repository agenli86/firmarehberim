import Link from 'next/link';
import { Eye, Clock, CheckCircle2, XCircle, Pause } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function AdminFirmalarPage({
  searchParams,
}: {
  searchParams: { durum?: string; q?: string };
}) {
  const supabase = createAdminClient();
  let query = supabase
    .from('firmalar')
    .select('*, iller:il_id (ad), kategoriler:kategori_id (ad)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (searchParams.durum && ['beklemede', 'onayli', 'reddedildi', 'askida'].includes(searchParams.durum)) {
    query = query.eq('durum', searchParams.durum);
  }
  if (searchParams.q) {
    query = query.ilike('firma_adi', `%${searchParams.q}%`);
  }

  const { data: firmalar } = await query;

  const durumFiltreler = [
    { key: '', label: 'Tümü', icon: null },
    { key: 'beklemede', label: 'Bekleyen', icon: Clock, color: 'amber' },
    { key: 'onayli', label: 'Onaylı', icon: CheckCircle2, color: 'green' },
    { key: 'reddedildi', label: 'Reddedilen', icon: XCircle, color: 'red' },
    { key: 'askida', label: 'Askıda', icon: Pause, color: 'gray' },
  ];

  return (
    <AdminShell active="/admin/firmalar" title="Firmalar">
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {durumFiltreler.map((f) => {
            const aktif = (searchParams.durum || '') === f.key;
            return (
              <Link
                key={f.key || 'all'}
                href={`/admin/firmalar${f.key ? `?durum=${f.key}` : ''}`}
                className={`admin-btn ${aktif ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
              >
                {f.label}
              </Link>
            );
          })}
          <Link href="/admin/firmalar/yeni" className="admin-btn admin-btn-success" style={{ marginLeft: 'auto' }}>
            + Yeni Firma Ekle
          </Link>
          <form method="GET" style={{ display: 'flex', gap: 4 }}>
            {searchParams.durum && <input type="hidden" name="durum" value={searchParams.durum} />}
            <input
              name="q"
              defaultValue={searchParams.q || ''}
              placeholder="Firma adı ara..."
              className="admin-input"
              style={{ width: 240 }}
            />
            <button type="submit" className="admin-btn admin-btn-primary">Ara</button>
          </form>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Firma</th>
            <th>İl / Kategori</th>
            <th>Telefon</th>
            <th>Durum</th>
            <th>Kayıt</th>
            <th style={{ width: 120 }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {firmalar && firmalar.length > 0 ? (
            firmalar.map((f: any) => (
              <tr key={f.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {f.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {f.firma_adi.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{f.firma_adi}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{f.yetkili_ad_soyad}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12 }}>
                  {f.iller?.ad || '—'}
                  <div style={{ color: '#6b7280' }}>{f.kategoriler?.ad || '—'}</div>
                </td>
                <td style={{ fontSize: 13 }}>{f.telefon}</td>
                <td>
                  <span className={`admin-badge admin-badge-${
                    f.durum === 'onayli' ? 'green' : f.durum === 'beklemede' ? 'amber' : f.durum === 'reddedildi' ? 'red' : 'gray'
                  }`}>
                    {f.durum}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: '#6b7280' }}>
                  {new Date(f.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td>
                  <Link href={`/admin/firmalar/${f.id}`} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                    <Eye size={14} /> Detay
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Kayıt yok.</td></tr>
          )}
        </tbody>
      </table>
    </AdminShell>
  );
}
