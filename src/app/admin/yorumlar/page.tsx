import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import YorumlarPanel from './YorumlarPanel';

export const dynamic = 'force-dynamic';

export default async function AdminYorumlarPage() {
  const supabase = createAdminClient();
  const { data: yorumlar } = await supabase
    .from('firma_yorumlari')
    .select(`*, firmalar:firma_id (id, firma_adi, slug, telefon)`)
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <AdminShell active="/admin/yorumlar" title="Tüm Yorumlar">
      <div style={{ padding: 12, background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#1e40af' }}>
        ℹ️ Tüm firmalara yapılan müşteri yorumlarını buradan onaylayabilir, cevap yazabilir veya silebilirsin. Onaylanmayan yorumlar firma sayfasında görünmez.
      </div>
      <YorumlarPanel yorumlar={yorumlar || []} />
    </AdminShell>
  );
}
