import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import IlceEditor from './IlceEditor';

export const dynamic = 'force-dynamic';

export default async function AdminIlcelerPage({ searchParams }: { searchParams: { il?: string } }) {
  const supabase = createAdminClient();
  const { data: iller } = await supabase.from('iller').select('id, ad, slug').eq('aktif', true).order('ad');

  const secilenIlSlug = searchParams.il || 'adana';
  const secilenIl = iller?.find((i) => i.slug === secilenIlSlug);

  let ilceler: any[] = [];
  if (secilenIl) {
    const { data } = await supabase
      .from('ilceler')
      .select('*')
      .eq('il_id', secilenIl.id)
      .order('sira');
    ilceler = data || [];
  }

  return (
    <AdminShell active="/admin/ilceler" title="İlçe Yönetimi">
      <IlceEditor iller={iller || []} secilenIlSlug={secilenIlSlug} secilenIl={secilenIl} ilceler={ilceler} />
    </AdminShell>
  );
}
