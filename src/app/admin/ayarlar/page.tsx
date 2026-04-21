import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import AyarlarForm from './AyarlarForm';

export const dynamic = 'force-dynamic';

export default async function AdminAyarlarPage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  return (
    <AdminShell active="/admin/ayarlar" title="Site Ayarları">
      <AyarlarForm settings={settings || { id: 1 }} />
    </AdminShell>
  );
}
