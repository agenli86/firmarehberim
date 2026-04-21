import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import DefterModerasyon from './DefterModerasyon';
import AdminDefterEkle from './AdminDefterEkle';

export const dynamic = 'force-dynamic';

export default async function AdminDefterPage() {
  const supabase = createAdminClient();

  const { data: mesajlar } = await supabase
    .from('defter_mesajlari')
    .select(`*, firmalar:firma_id (id, firma_adi, slug),
             nereden:nereden_il_id (ad), nereye:nereye_il_id (ad)`)
    .order('created_at', { ascending: false })
    .limit(200);

  const { data: firmalar } = await supabase
    .from('firmalar')
    .select('id, firma_adi')
    .eq('durum', 'onayli')
    .order('firma_adi');

  const { data: iller } = await supabase.from('iller').select('id, ad').eq('aktif', true).order('ad');

  return (
    <AdminShell active="/admin/defter" title="Defter Mesajları">
      <AdminDefterEkle firmalar={firmalar || []} iller={iller || []} />
      <div style={{ marginTop: 24 }}>
        <DefterModerasyon mesajlar={mesajlar || []} />
      </div>
    </AdminShell>
  );
}
