import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Phone, Mail, MapPin, User, FileText, Camera, CreditCard, Star, Award } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { createAdminClient } from '@/lib/supabase/admin';
import FirmaOnayActions from './FirmaOnayActions';
import FirmaGaleriAdmin from './FirmaGaleriAdmin';
import FirmaYorumAdmin from './FirmaYorumAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminFirmaDetayPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: firma } = await supabase
    .from('firmalar')
    .select('*, iller:il_id (ad, slug), kategoriler:kategori_id (ad, slug), ilceler:ilce_id (ad, slug)')
    .eq('id', params.id)
    .single();

  if (!firma) notFound();

  const [{ data: iller }, { data: kategoriler }, { data: ilceler }, { data: galeri }, { data: yorumlar }] = await Promise.all([
    supabase.from('iller').select('id, ad').eq('aktif', true).order('ad'),
    supabase.from('kategoriler').select('id, ad').eq('aktif', true).order('sira'),
    firma.il_id ? supabase.from('ilceler').select('id, ad').eq('il_id', firma.il_id).eq('aktif', true).order('sira') : Promise.resolve({ data: [] }),
    supabase.from('firma_galeri').select('*').eq('firma_id', firma.id).order('sira'),
    supabase.from('firma_yorumlari').select('*').eq('firma_id', firma.id).order('created_at', { ascending: false }),
  ]);

  const { data: mesajSayisi } = await supabase
    .from('defter_mesajlari')
    .select('id', { count: 'exact', head: true })
    .eq('firma_id', firma.id);

  return (
    <AdminShell active="/admin/firmalar">
      <Link href="/admin/firmalar" className="admin-btn admin-btn-ghost" style={{ marginBottom: 16 }}>
        <ChevronLeft size={16} /> Geri
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Başlık */}
          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {firma.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={firma.logo_url} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: 12, background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 32 }}>
                  {firma.firma_adi.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{firma.firma_adi}</h2>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <span className={`admin-badge admin-badge-${
                    firma.durum === 'onayli' ? 'green' : firma.durum === 'beklemede' ? 'amber' : firma.durum === 'reddedildi' ? 'red' : 'gray'
                  }`}>{firma.durum}</span>
                  {firma.one_cikan && <span className="admin-badge admin-badge-amber"><Star size={10} style={{ display: 'inline' }} /> Öne Çıkan</span>}
                  {firma.premium && <span className="admin-badge admin-badge-blue"><Award size={10} style={{ display: 'inline' }} /> Premium</span>}
                </div>
              </div>
            </div>
          </div>

          {/* İletişim bilgileri */}
          <div className="admin-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Firma Bilgileri</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <Info icon={User} label="Yetkili" value={firma.yetkili_ad_soyad} />
              <Info icon={Phone} label="Telefon" value={firma.telefon} />
              <Info icon={Mail} label="E-posta" value={firma.email} />
              <Info icon={Phone} label="WhatsApp" value={firma.whatsapp || '—'} />
              <Info icon={MapPin} label="İl" value={firma.iller?.ad || '—'} />
              <Info icon={FileText} label="Kategori" value={firma.kategoriler?.ad || '—'} />
              <Info icon={FileText} label="Vergi No" value={firma.vergi_no || '—'} />
              <Info icon={FileText} label="Slug" value={firma.slug} />
            </div>
            {firma.adres && (
              <div style={{ marginTop: 12, padding: 10, background: '#f9fafb', borderRadius: 6, fontSize: 13 }}>
                <strong>Adres:</strong> {firma.adres}
              </div>
            )}
            {firma.hakkinda && (
              <div style={{ marginTop: 12, padding: 10, background: '#f9fafb', borderRadius: 6, fontSize: 13 }}>
                <strong>Hakkında:</strong><br />{firma.hakkinda}
              </div>
            )}
          </div>

          {/* Belgeler - SENİN KONTROL EDECEĞİN KRİTİK KISIM */}
          <div className="admin-card" style={{ border: '2px solid #f59e0b' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#92400e' }}>
              🔒 Doğrulama Belgeleri (Sadece Admin Görebilir)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <BelgeKart url={firma.kimlik_url} icon={CreditCard} label="Kimlik Fotoğrafı" />
              <BelgeKart url={firma.selfie_url} icon={Camera} label="Kimlikle Selfie" />
              <BelgeKart url={firma.vergi_levhasi_url} icon={FileText} label="Vergi Levhası" />
            </div>
            <p style={{ marginTop: 12, fontSize: 12, color: '#92400e' }}>
              ⚠️ Kontrol et: Kimlik + selfie + vergi levhasındaki isim firma adıyla uyumlu mu?
            </p>
          </div>

          {/* İstatistik */}
          <div className="admin-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>İstatistik</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <StatBox label="Görüntülenme" value={firma.goruntulenme || 0} />
              <StatBox label="Defter Mesajı" value={mesajSayisi?.length || 0} />
              <StatBox label="Kayıt Tarihi" value={new Date(firma.created_at).toLocaleDateString('tr-TR')} />
            </div>
          </div>
        </div>

        {/* Sağ: Onay/Reddet/Sıralama actions */}
        <div>
          <FirmaOnayActions firma={firma} iller={iller || []} ilceler={ilceler || []} kategoriler={kategoriler || []} />
        </div>
      </div>

      {/* Alt: Galeri yönetimi */}
      <div style={{ marginTop: 24 }}>
        <FirmaGaleriAdmin firmaId={firma.id} galeri={galeri || []} />
      </div>

      {/* Alt: Yorum moderasyon */}
      <div style={{ marginTop: 24 }}>
        <FirmaYorumAdmin firmaId={firma.id} yorumlar={yorumlar || []} />
      </div>
    </AdminShell>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Icon size={14} style={{ color: '#9ca3af', marginTop: 2 }} />
      <div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>{label}</div>
        <div style={{ fontWeight: 500, color: '#111827' }}>{value}</div>
      </div>
    </div>
  );
}

function BelgeKart({ url, icon: Icon, label }: { url: string | null; icon: any; label: string }) {
  if (!url) {
    return (
      <div style={{ border: '2px dashed #d1d5db', borderRadius: 8, padding: 16, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
        <Icon size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
        {label}<br /><em>Yok</em>
      </div>
    );
  }
  const isPdf = url.toLowerCase().endsWith('.pdf');
  return (
    <a href={url} target="_blank" rel="noopener" style={{ display: 'block', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', textDecoration: 'none' }}>
      <div style={{ background: '#f9fafb', padding: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#374151' }}>
        <Icon size={14} /> {label}
      </div>
      {isPdf ? (
        <div style={{ padding: 20, textAlign: 'center', background: '#fef3c7' }}>
          <FileText size={32} style={{ color: '#92400e', margin: '0 auto 8px', display: 'block' }} />
          <span style={{ fontSize: 11, color: '#92400e' }}>PDF Aç</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
      )}
    </a>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 6, textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{label}</div>
    </div>
  );
}
