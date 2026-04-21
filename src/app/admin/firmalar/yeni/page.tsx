import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import YeniFirmaForm from './YeniFirmaForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function YeniFirmaPage() {
  const supabase = createAdminClient();
  const { data: iller } = await supabase.from('iller').select('id, ad').eq('aktif', true).order('ad');
  const { data: kategoriler } = await supabase.from('kategoriler').select('id, ad').eq('aktif', true).order('sira');

  return (
    <AdminShell active="/admin/firmalar">
      <Link href="/admin/firmalar" className="admin-btn admin-btn-ghost" style={{ marginBottom: 16 }}>
        <ChevronLeft size={16} /> Geri
      </Link>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Yeni Firma Ekle</h2>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        Firmayı belgesiz olarak sen ekliyorsan, durumu &quot;onaylı&quot; seçebilirsin (belge kontrolü atlanır).
      </p>
      <YeniFirmaForm iller={iller || []} kategoriler={kategoriler || []} />
    </AdminShell>
  );
}
