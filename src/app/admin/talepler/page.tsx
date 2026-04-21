import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import TalepEditor from './TalepEditor';

export const dynamic = 'force-dynamic';

export default async function AdminTaleplerPage() {
  const supabase = createAdminClient();
  const { data: talepler } = await supabase
    .from('talepler')
    .select(`*, nereden:nereden_il_id (ad), nereye:nereye_il_id (ad), kategoriler:kategori_id (ad)`)
    .order('created_at', { ascending: false })
    .limit(200);
  return (
    <AdminShell active="/admin/talepler" title="Müşteri Talepleri">
      <TalepEditor talepler={talepler || []} />
    </AdminShell>
  );
}
