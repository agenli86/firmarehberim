import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, BookOpen, Image as ImageIcon, MapPin,
  Grid3x3, Inbox, Settings, LogOut, Shield,
} from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import './admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      {children}
    </div>
  );
}
