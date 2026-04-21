'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Store, PlusCircle, LogIn, UserPlus, Newspaper, Menu, X, Phone } from 'lucide-react';

const menuItems = [
  { href: '/defter', label: 'Defter', icon: BookOpen },
  { href: '/firmalar', label: 'Firmalar', icon: Store },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/teklif-al', label: 'Teklif Al', icon: PlusCircle },
];

export default function HeaderClient({ settings }: { settings: any }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const yazi1 = settings?.logo_yazi_1 || 'NAKLİYAT';
  const yazi2 = settings?.logo_yazi_2 || 'PLATFORMU';
  const siteAdi = settings?.site_adi || 'Nakliyat Platformu';

  // Sayfa değişince menüyü kapat
  useEffect(() => { setOpen(false); }, [pathname]);

  // Açık menüyle scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {settings?.topbar_metin && (
        <div className="bg-primary-600 text-white text-xs py-1.5 text-center px-4">
          {settings.topbar_metin}
        </div>
      )}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {settings?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo_url} alt={siteAdi} className="h-10 w-auto" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {yazi1.charAt(0)}
                </div>
                <div className="hidden xs:block sm:block">
                  <div className="font-heading font-extrabold text-primary-600 leading-tight text-sm">{yazi1}</div>
                  <div className="text-[10px] text-primary-500 font-semibold tracking-wider leading-tight">{yazi2}</div>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Navigation - lg+ */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                >
                  <Icon size={16} /> {item.label}
                </Link>
              );
            })}
            <Link href="/giris" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-lg hover:bg-primary-50">
              <LogIn size={16} /> Giriş
            </Link>
            <Link href="/kayit" className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg ml-2">
              <UserPlus size={16} /> Kaydol
            </Link>
          </nav>

          {/* Mobile - Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {settings?.telefon && (
              <a
                href={`tel:${settings.telefon}`}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-lg"
              >
                <Phone size={14} />
                <span className="hidden xs:inline">Ara</span>
              </a>
            )}
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              aria-label="Menüyü aç"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl lg:hidden overflow-y-auto animate-slide-in">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
              <div className="flex items-center gap-2">
                {settings?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.logo_url} alt="" className="h-9 w-auto bg-white rounded p-1" />
                ) : (
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center font-bold">
                    {yazi1.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-heading font-bold text-sm leading-tight">{yazi1}</div>
                  <div className="text-[10px] opacity-80 tracking-wider leading-tight">{yazi2}</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20"
                aria-label="Kapat"
              >
                <X size={22} />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const aktif = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1 ${
                      aktif ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} /> {item.label}
                  </Link>
                );
              })}

              <div className="border-t border-gray-200 my-3" />

              <Link
                href="/giris"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 mb-1"
              >
                <LogIn size={18} /> Firma Girişi
              </Link>
              <Link
                href="/kayit"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white bg-primary-500 hover:bg-primary-600"
              >
                <UserPlus size={18} /> Firma Kaydol
              </Link>

              {/* Quick contact */}
              {(settings?.telefon) && (
                <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg border border-primary-100">
                  <div className="text-xs text-gray-600 mb-1">Bize Ulaşın</div>
                  <a
                    href={`tel:${settings.telefon}`}
                    className="flex items-center gap-2 text-primary-700 font-bold"
                  >
                    <Phone size={16} /> {settings.telefon}
                  </a>
                </div>
              )}
            </nav>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.22s cubic-bezier(0.33, 1, 0.68, 1);
        }
      `}</style>
    </>
  );
}
