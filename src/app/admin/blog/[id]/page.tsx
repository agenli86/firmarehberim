import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import BlogEditor from './BlogEditor';

export const dynamic = 'force-dynamic';

export default async function AdminBlogEditPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: yazi } = await supabase.from('blog_yazilar').select('*').eq('id', parseInt(params.id)).single();
  if (!yazi) notFound();

  return (
    <AdminShell active="/admin/blog">
      <Link href="/admin/blog" className="admin-btn admin-btn-ghost" style={{ marginBottom: 16 }}>
        <ChevronLeft size={16} /> Geri
      </Link>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{yazi.baslik} - Düzenle</h2>
      <BlogEditor yazi={yazi} />
    </AdminShell>
  );
}
