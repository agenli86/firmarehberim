import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import IletisimListesi from './IletisimListesi';

export const dynamic = 'force-dynamic';

export default async function AdminIletisimPage() {
  const supabase = createAdminClient();
  const { data: mesajlar } = await supabase
    .from('iletisim_mesajlari')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <AdminShell active="/admin/iletisim" title="İletişim Mesajları">
      <IletisimListesi mesajlar={mesajlar || []} />
    </AdminShell>
  );
}
