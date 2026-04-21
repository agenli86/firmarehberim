export interface Il {
  id: number;
  ad: string;
  slug: string;
  plaka: number;
  sira: number;
  aktif: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_content: string | null;
}

export interface Kategori {
  id: number;
  ad: string;
  slug: string;
  aciklama: string | null;
  ikon: string | null;
  sira: number;
  aktif: boolean;
  seo_title: string | null;
  seo_description: string | null;
}

export type FirmaDurum = 'beklemede' | 'onayli' | 'reddedildi' | 'askida';

export interface Firma {
  id: string;
  user_id: string | null;
  firma_adi: string;
  slug: string;
  yetkili_ad_soyad: string;
  telefon: string;
  email: string;
  whatsapp: string | null;
  website: string | null;
  adres: string | null;
  hakkinda: string | null;
  il_id: number | null;
  kategori_id: number | null;
  logo_url: string | null;
  kimlik_url: string | null;
  selfie_url: string | null;
  vergi_levhasi_url: string | null;
  vergi_no: string | null;
  durum: FirmaDurum;
  red_sebebi: string | null;
  onay_tarihi: string | null;
  sira: number;
  one_cikan: boolean;
  premium: boolean;
  premium_bitis: string | null;
  goruntulenme: number;
  son_giris: string | null;
  created_at: string;
  updated_at: string;
  // join
  iller?: Il;
  kategoriler?: Kategori;
}

export type MesajTip = 'yuk' | 'bos_arac' | 'duyuru';
export type OnayDurum = 'beklemede' | 'onayli' | 'reddedildi';

export interface DefterMesaj {
  id: number;
  firma_id: string;
  mesaj: string;
  tip: MesajTip;
  nereden_il_id: number | null;
  nereye_il_id: number | null;
  nereden_text: string | null;
  nereye_text: string | null;
  aktif: boolean;
  silindi: boolean;
  goruntulenme: number;
  onay_durum: OnayDurum;
  onay_tarihi: string | null;
  red_sebebi: string | null;
  created_at: string;
  // join
  firmalar?: Firma;
  nereden?: Il;
  nereye?: Il;
}

export interface GuncellemeTalep {
  id: number;
  firma_id: string;
  degisiklikler: Record<string, any>;
  onay_durum: OnayDurum;
  red_sebebi: string | null;
  created_at: string;
  onay_tarihi: string | null;
  firmalar?: Firma;
}

export interface Reklam {
  id: number;
  baslik: string;
  gorsel_url: string;
  link: string | null;
  pozisyon: 'sag' | 'sol' | 'ust' | 'alt' | 'icerik';
  sayfa: string;
  sira: number;
  aktif: boolean;
  baslangic_tarihi: string | null;
  bitis_tarihi: string | null;
  tiklanma: number;
  gosterim: number;
  created_at: string;
}

export interface Talep {
  id: number;
  ad_soyad: string;
  telefon: string;
  email: string | null;
  nereden_il_id: number | null;
  nereye_il_id: number | null;
  tarih: string | null;
  aciklama: string | null;
  kategori_id: number | null;
  durum: 'yeni' | 'incelendi' | 'kapandi';
  okundu: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  site_adi: string;
  site_slogan: string;
  logo_url: string | null;
  favicon_url: string | null;
  telefon: string | null;
  whatsapp: string | null;
  email: string | null;
  adres: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  seo_title: string;
  seo_description: string;
  seo_keywords: string | null;
  google_analytics: string | null;
  google_verification: string | null;
  yandex_verification: string | null;
  og_image: string | null;
  topbar_metin: string | null;
  footer_metin: string | null;
  kayit_acik: boolean;
  defter_acik: boolean;
}

export interface PageSeo {
  id: number;
  sayfa_key: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonical: string | null;
  og_image: string | null;
  h1: string | null;
  icerik: string | null;
}
