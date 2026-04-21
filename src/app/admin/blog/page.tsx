import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Edit, Plus, ExternalLink, Eye, EyeOff, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const supabase = createAdminClient();
  const { data: yazilar } = await supabase.from('blog_yazilar').select('*').order('created_at', { ascending: false });

  return (
    <AdminShell active="/admin/blog" title="Blog Yazıları">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link href="/admin/blog/yeni" className="admin-btn admin-btn-primary">
          <Plus size={14} /> Yeni Blog Yazısı
        </Link>
        <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 'auto' }}>
          {yazilar?.length || 0} yazı
        </span>
      </div>

      {yazilar && yazilar.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Kategori</th>
              <th style={{ width: 100 }}>Durum</th>
              <th style={{ width: 100 }}>Tarih</th>
              <th style={{ width: 180 }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {yazilar.map((y: any) => (
              <tr key={y.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {y.one_cikan && <Star size={12} style={{ display: 'inline', color: '#f59e0b', fill: '#f59e0b', marginRight: 4 }} />}
                    {y.baslik}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>/blog/{y.slug}</div>
                </td>
                <td style={{ fontSize: 12 }}>{y.kategori || '—'}</td>
                <td>
                  {y.yayinda ? (
                    <span className="admin-badge admin-badge-green">Yayında</span>
                  ) : (
                    <span className="admin-badge admin-badge-gray">Taslak</span>
                  )}
                </td>
                <td style={{ fontSize: 12, color: '#6b7280' }}>
                  {new Date(y.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Link href={`/admin/blog/${y.id}`} className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                      <Edit size={12} /> Düzenle
                    </Link>
                    <a href={`/blog/${y.slug}`} target="_blank" rel="noopener" className="admin-btn admin-btn-ghost" style={{ padding: '4px 10px' }}>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="admin-card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          Henüz blog yazısı yok. &quot;Yeni Blog Yazısı&quot; ile ekle.
        </div>
      )}
    </AdminShell>
  );
}
