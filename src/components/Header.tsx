import { createAdminClient } from '@/lib/supabase/admin';
import HeaderClient from './HeaderClient';

export default async function Header() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('site_adi, logo_url, logo_yazi_1, logo_yazi_2, topbar_metin, telefon')
    .eq('id', 1)
    .single();

  return <HeaderClient settings={settings} />;
}
