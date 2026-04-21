import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import IllerEditor from './IllerEditor';

export const dynamic = 'force-dynamic';

export default async function AdminIllerPage() {
  const supabase = createAdminClient();
  const { data: iller } = await supabase.from('iller').select('*').order('plaka', { ascending: true });
  return (
    <AdminShell active="/admin/iller" title="İller">
      <IllerEditor iller={iller || []} />
    </AdminShell>
  );
}
