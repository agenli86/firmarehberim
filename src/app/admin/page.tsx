import Link from 'next/link';
import { Users, BookOpen, Clock, CheckCircle2, Inbox, TrendingUp } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: toplamFirma },
    { count: bekleyenFirma },
    { count: onayliFirma },
    { count: toplamMesaj },
    { count: bekleyenMesaj },
    { count: yeniTalep },
  ] = await Promise.all([
    supabase.from('firmalar').select('*', { count: 'exact', head: true }),
    supabase.from('firmalar').select('*', { count: 'exact', head: true }).eq('durum', 'beklemede'),
    supabase.from('firmalar').select('*', { count: 'exact', head: true }).eq('durum', 'onayli'),
    supabase.from('defter_mesajlari').select('*', { count: 'exact', head: true }).eq('aktif', true).eq('silindi', false).eq('onay_durum', 'onayli'),
    supabase.from('defter_mesajlari').select('*', { count: 'exact', head: true }).eq('onay_durum', 'beklemede').eq('silindi', false),
    supabase.from('talepler').select('*', { count: 'exact', head: true }).eq('okundu', false),
  ]);

  const { data: sonFirmalar } = await supabase
    .from('firmalar')
    .select('id, firma_adi, slug, durum, created_at, iller:il_id (ad)')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: sonMesajlar } = await supabase
    .from('defter_mesajlari')
    .select('id, mesaj, tip, created_at, firmalar:firma_id (firma_adi, slug)')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { label: 'Toplam Firma', value: toplamFirma || 0, icon: Users, color: '#3b82f6', href: '/admin/firmalar' },
    { label: 'Firma Onay Bekleyen', value: bekleyenFirma || 0, icon: Clock, color: '#f59e0b', href: '/admin/firmalar?durum=beklemede' },
    { label: 'Onaylı Firma', value: onayliFirma || 0, icon: CheckCircle2, color: '#10b981', href: '/admin/firmalar?durum=onayli' },
    { label: 'Defter (Yayında)', value: toplamMesaj || 0, icon: BookOpen, color: '#8b5cf6', href: '/admin/defter' },
    { label: 'Defter Onay Bekleyen', value: bekleyenMesaj || 0, icon: Clock, color: '#f97316', href: '/admin/defter' },
    { label: 'Okunmayan Talep', value: yeniTalep || 0, icon: Inbox, color: '#ef4444', href: '/admin/talepler' },
  ];

  return (
    <AdminShell active="/admin" title="Dashboard">
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="admin-card" style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{s.value}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Son Kayıt Olan Firmalar</h3>
            <Link href="/admin/firmalar" style={{ fontSize: 13, color: '#f59e0b' }}>Tümü →</Link>
          </div>
          {sonFirmalar && sonFirmalar.length > 0 ? (
            <table style={{ width: '100%', fontSize: 13 }}>
              <tbody>
                {sonFirmalar.map((f: any) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 0' }}>
                      <Link href={`/admin/firmalar/${f.id}`} style={{ fontWeight: 600, color: '#111827' }}>
                        {f.firma_adi}
                      </Link>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{f.iller?.ad || '—'}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0' }}>
                      <span className={`admin-badge admin-badge-${
                        f.durum === 'onayli' ? 'green' : f.durum === 'beklemede' ? 'amber' : f.durum === 'reddedildi' ? 'red' : 'gray'
                      }`}>
                        {f.durum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={{ color: '#6b7280', fontSize: 13 }}>Henüz firma yok.</p>}
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Son Defter Mesajları</h3>
            <Link href="/admin/defter" style={{ fontSize: 13, color: '#f59e0b' }}>Tümü →</Link>
          </div>
          {sonMesajlar && sonMesajlar.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sonMesajlar.map((m: any) => (
                <div key={m.id} style={{ padding: 8, background: '#f9fafb', borderRadius: 6, fontSize: 13 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{m.firmalar?.firma_adi}</div>
                  <div style={{ color: '#4b5563', fontSize: 12 }}>{m.mesaj.slice(0, 80)}...</div>
                </div>
              ))}
            </div>
          ) : <p style={{ color: '#6b7280', fontSize: 13 }}>Henüz mesaj yok.</p>}
        </div>
      </div>
    </AdminShell>
  );
}
