import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import SabitSayfaEditor from './SabitSayfaEditor';

export const dynamic = 'force-dynamic';

export default async function SabitSayfaEditPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: sayfa } = await supabase.from('sabit_sayfalar').select('*').eq('id', parseInt(params.id)).single();
  if (!sayfa) notFound();

  return (
    <AdminShell active="/admin/sabit-sayfalar">
      <Link href="/admin/sabit-sayfalar" className="admin-btn admin-btn-ghost" style={{ marginBottom: 16 }}>
        <ChevronLeft size={16} /> Geri
      </Link>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{sayfa.baslik} - Düzenle</h2>
      <SabitSayfaEditor sayfa={sayfa} />
    </AdminShell>
  );
}
