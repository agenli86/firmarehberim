import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import ReklamEditor from './ReklamEditor';

export const dynamic = 'force-dynamic';

export default async function AdminReklamlarPage() {
  const supabase = createAdminClient();
  const { data: reklamlar } = await supabase.from('reklamlar').select('*').order('sira', { ascending: true }).limit(100);
  return (
    <AdminShell active="/admin/reklamlar" title="Reklam Yönetimi">
      <ReklamEditor reklamlar={reklamlar || []} />
    </AdminShell>
  );
}
