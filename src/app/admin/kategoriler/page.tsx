import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import KategoriEditor from './KategoriEditor';

export const dynamic = 'force-dynamic';

export default async function AdminKategorilerPage() {
  const supabase = createAdminClient();
  const { data: kategoriler } = await supabase.from('kategoriler').select('*').order('sira', { ascending: true });
  return (
    <AdminShell active="/admin/kategoriler" title="Kategoriler">
      <KategoriEditor kategoriler={kategoriler || []} />
    </AdminShell>
  );
}
