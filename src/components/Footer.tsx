import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function Footer() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  const { data: populerIller } = await supabase
    .from('iller')
    .select('ad, slug')
    .eq('aktif', true)
    .order('sira', { ascending: true })
    .limit(12);

  const yil = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {settings?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo_url} alt={settings?.site_adi || ''} className="h-10 w-auto bg-white p-1 rounded" />
            ) : (
              <>
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {(settings?.site_adi || 'N').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-heading font-extrabold text-white leading-tight text-sm">
                    {settings?.site_adi || 'NAKLİYAT PLATFORMU'}
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {settings?.site_slogan || 'Türkiye geneli onaylı nakliyat firmaları rehberi.'}
          </p>
          <div className="flex gap-3 mt-4">
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-500 flex items-center justify-center">
                <Facebook size={16} />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-500 flex items-center justify-center">
                <Instagram size={16} />
              </a>
            )}
            {settings?.twitter && (
              <a href={settings.twitter} target="_blank" rel="noopener" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-500 flex items-center justify-center">
                <Twitter size={16} />
              </a>
            )}
            {settings?.youtube && (
              <a href={settings.youtube} target="_blank" rel="noopener" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-500 flex items-center justify-center">
                <Youtube size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white mb-4">Kurumsal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/hakkimizda" className="hover:text-primary-400">Hakkımızda</Link></li>
            <li><Link href="/blog" className="hover:text-primary-400">Blog</Link></li>
            <li><Link href="/iletisim" className="hover:text-primary-400">İletişim</Link></li>
            <li><Link href="/kayit" className="hover:text-primary-400">Firma Kaydı</Link></li>
            <li><Link href="/giris" className="hover:text-primary-400">Firma Girişi</Link></li>
            <li><Link href="/teklif-al" className="hover:text-primary-400">Teklif Al</Link></li>
            <li><Link href="/kvkk" className="hover:text-primary-400">KVKK</Link></li>
            <li><Link href="/sozlesme" className="hover:text-primary-400">Üyelik Sözleşmesi</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white mb-4">Popüler İller</h4>
          <ul className="space-y-1.5 text-sm grid grid-cols-2">
            {populerIller?.map((il) => (
              <li key={il.slug}>
                <Link href={`/firmalar/${il.slug}`} className="hover:text-primary-400">{il.ad}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white mb-4">İletişim</h4>
          <ul className="space-y-3 text-sm">
            {settings?.telefon && (
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-primary-400 mt-0.5" />
                <a href={`tel:${settings.telefon}`}>{settings.telefon}</a>
              </li>
            )}
            {settings?.email && (
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-primary-400 mt-0.5" />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
            {settings?.adres && (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-primary-400 mt-0.5" />
                <span>{settings.adres}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {yil} {settings?.site_adi || 'Nakliyat Platformu'}. Tüm hakları saklıdır.
        {settings?.footer_metin && <span className="ml-2">{settings.footer_metin}</span>}
      </div>
    </footer>
  );
}
