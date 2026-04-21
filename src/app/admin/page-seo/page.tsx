import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import PageSeoEditor from './PageSeoEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPageSeoPage() {
  const supabase = createAdminClient();
  const { data: pageSeos } = await supabase.from('page_seo').select('*').order('sayfa_key');

  // Eğer eksik sayfa varsa default ekle
  const varsayilan = ['anasayfa', 'defter', 'firmalar', 'kayit', 'giris', 'teklif-al'];
  const mevcutKeys = new Set((pageSeos || []).map((p) => p.sayfa_key));
  const eksikler = varsayilan.filter((k) => !mevcutKeys.has(k));

  // Eksikleri otomatik ekle
  if (eksikler.length > 0) {
    for (const key of eksikler) {
      await supabase.from('page_seo').insert({ sayfa_key: key, title: '', description: '' });
    }
  }

  const { data: guncelSeos } = await supabase.from('page_seo').select('*').order('sayfa_key');

  return (
    <AdminShell active="/admin/page-seo" title="Sayfa SEO Ayarları">
      <div style={{ padding: 12, background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#1e40af' }}>
        ℹ️ Ana sayfa, defter, firmalar gibi genel sayfaların meta başlık/açıklama/canonical ayarlarını buradan yapabilirsin. Boş bıraktığın sayfa için kodlardaki varsayılan başlık kullanılır.
      </div>
      <PageSeoEditor sayfalar={guncelSeos || []} />
    </AdminShell>
  );
}
