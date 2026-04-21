import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import IlKategoriSeoEditor from './IlKategoriSeoEditor';

export const dynamic = 'force-dynamic';

export default async function AdminIlKategoriSeoPage({ searchParams }: { searchParams: { il?: string; kategori?: string } }) {
  const supabase = createAdminClient();
  const [{ data: iller }, { data: kategoriler }] = await Promise.all([
    supabase.from('iller').select('id, ad, slug').eq('aktif', true).order('ad'),
    supabase.from('kategoriler').select('id, ad, slug').eq('aktif', true).order('sira'),
  ]);

  const ilSlug = searchParams.il || iller?.[0]?.slug;
  const katSlug = searchParams.kategori || kategoriler?.[0]?.slug;

  const il = iller?.find((i) => i.slug === ilSlug);
  const kat = kategoriler?.find((k) => k.slug === katSlug);

  let mevcutSeo = null;
  if (il && kat) {
    const { data } = await supabase
      .from('il_kategori_seo')
      .select('*')
      .eq('il_id', il.id)
      .eq('kategori_id', kat.id)
      .maybeSingle();
    mevcutSeo = data;
  }

  return (
    <AdminShell active="/admin/il-kategori-seo" title="İl + Kategori SEO Eşleştirme">
      <div style={{ padding: 12, background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#1e40af' }}>
        ℹ️ Her il+kategori için ayrı meta başlık, açıklama ve içerik yazabilirsin. Örn: <strong>Adana Evden Eve Nakliyat</strong> ve <strong>Ankara Evden Eve Nakliyat</strong> sayfalarının yazıları farklı olacak.
      </div>

      <IlKategoriSeoEditor
        iller={iller || []}
        kategoriler={kategoriler || []}
        secilenIl={il}
        secilenKategori={kat}
        mevcutSeo={mevcutSeo}
      />
    </AdminShell>
  );
}
