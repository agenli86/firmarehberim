import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Edit, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SabitSayfalarPage() {
  const supabase = createAdminClient();
  const { data: sayfalar } = await supabase.from('sabit_sayfalar').select('*').order('sira');

  return (
    <AdminShell active="/admin/sabit-sayfalar" title="Sabit Sayfalar">
      <div style={{ padding: 12, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#92400e' }}>
        ℹ️ Hakkımızda, KVKK, Sözleşme ve İletişim gibi sayfaların içeriğini ve SEO ayarlarını buradan düzenleyebilirsin.
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Başlık</th>
            <th>URL</th>
            <th style={{ width: 80 }}>Durum</th>
            <th style={{ width: 180 }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {sayfalar?.map((s: any) => (
            <tr key={s.id}>
              <td style={{ fontWeight: 600 }}>{s.baslik}</td>
              <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>/{s.slug}</td>
              <td>
                {s.aktif ? <span className="admin-badge admin-badge-green">Aktif</span> : <span className="admin-badge admin-badge-gray">Pasif</span>}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/admin/sabit-sayfalar/${s.id}`} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                    <Edit size={14} /> Düzenle
                  </Link>
                  <a href={`/${s.slug}`} target="_blank" rel="noopener" className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                    <ExternalLink size={14} /> Gör
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
