'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, Image as ImageIcon,
  MapPin, Grid3x3, Inbox, Settings, LogOut, Shield,
  FileText, MessageSquare, Search, Newspaper, Menu, X,
} from 'lucide-react';

const menu = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/firmalar', label: 'Firmalar', icon: Users },
  { href: '/admin/defter', label: 'Defter Mesajları', icon: BookOpen },
  { href: '/admin/yorumlar', label: 'Yorumlar', icon: MessageSquare },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/reklamlar', label: 'Reklamlar', icon: ImageIcon },
  { href: '/admin/iller', label: 'İller', icon: MapPin },
  { href: '/admin/ilceler', label: 'İlçeler', icon: MapPin },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: Grid3x3 },
  { href: '/admin/talepler', label: 'Teklif Talepleri', icon: Inbox },
  { href: '/admin/iletisim', label: 'İletişim Mesajları', icon: MessageSquare },
  { href: '/admin/sabit-sayfalar', label: 'Sabit Sayfalar', icon: FileText },
  { href: '/admin/page-seo', label: 'Sayfa SEO', icon: Search },
  { href: '/admin/il-kategori-seo', label: 'İl+Kategori SEO', icon: Search },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: Settings },
];

export default function AdminShell({
  children,
  active,
  title,
}: {
  children: React.ReactNode;
  active?: string;
  title?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Sayfa değişince menüyü kapat
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const aktifBaslik = title || menu.find((m) => m.href === active)?.label || 'Admin';

  return (
    <div className="admin-shell">
      {/* Mobile Header - sadece mobilde */}
      <div className="admin-mobile-header">
        <button
          onClick={() => setMenuOpen(true)}
          style={{ background: 'none', border: 'none', color: 'white', padding: 6, cursor: 'pointer' }}
          aria-label="Menü"
        >
          <Menu size={24} />
        </button>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{aktifBaslik}</div>
        <div style={{ width: 36 }} /> {/* spacer */}
      </div>

      {/* Overlay (mobilde menu açıkken) */}
      {menuOpen && (
        <div className="admin-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #334155', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 0 }}>
            <div style={{
              width: 36, height: 36, background: '#f59e0b',
              borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: 700,
            }}>
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>Admin Panel</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Nakliyat Platform</div>
            </div>
          </Link>
          {/* Close button - sadece mobilde, menu açıkken */}
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 4, display: 'none' }}
            className="admin-close-btn"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          {menu.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.href || (m.exact && active === m.href);
            return (
              <Link key={m.href} href={m.href} className={isActive ? 'active' : ''}>
                <Icon size={16} />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
          <Link href="/" style={{ padding: '8px 0', fontSize: 13 }}>
            ← Siteyi Gör
          </Link>
          <form action="/api/cikis" method="post" style={{ marginTop: 8 }}>
            <button type="submit" style={{
              background: 'none', border: 'none', color: '#cbd5e1',
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 13, cursor: 'pointer', padding: '8px 0',
            }}>
              <LogOut size={14} /> Çıkış
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">
        {title && (
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{title}</h1>
          </div>
        )}
        {children}
      </main>

      <style jsx>{`
        @media (max-width: 1024px) {
          :global(.admin-sidebar.open) .admin-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
