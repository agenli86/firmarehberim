import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import BlogEditor from '../[id]/BlogEditor';

export default function YeniBlogPage() {
  return (
    <AdminShell active="/admin/blog">
      <Link href="/admin/blog" className="admin-btn admin-btn-ghost" style={{ marginBottom: 16 }}>
        <ChevronLeft size={16} /> Geri
      </Link>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Yeni Blog Yazısı</h2>
      <BlogEditor yazi={null} />
    </AdminShell>
  );
}
