import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle2, XCircle, Pause, BookOpen, Plus, LogOut } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { zamanOnce } from '@/lib/utils';
import PanelForm from './PanelForm';

export const dynamic = 'force-dynamic';

export default async function PanelPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/giris');

  const adminDb = createAdminClient();
  const { data: firma } = await adminDb
    .from('firmalar')
    .select('*, iller:il_id (ad), kategoriler:kategori_id (ad)')
    .eq('user_id', user.id)
    .single();

  if (!firma) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-white border rounded-lg p-8">
          <h1 className="font-heading font-bold text-xl mb-2">Firma bulunamadı</h1>
          <p className="text-gray-600 mb-4">Bu hesaba bağlı bir firma kaydı yok.</p>
          <Link href="/kayit" className="inline-block bg-primary-500 text-white px-4 py-2 rounded-md font-semibold">Firma Kaydı</Link>
        </div>
      </main>
    );
  }

  const { data: iller } = await adminDb.from('iller').select('id, ad').eq('aktif', true).order('ad');
  const { data: mesajlar } = await adminDb
    .from('defter_mesajlari')
    .select(`*, nereden:nereden_il_id (ad), nereye:nereye_il_id (ad)`)
    .eq('firma_id', firma.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const durumConfig: Record<string, { icon: any; color: string; label: string; desc: string }> = {
    beklemede: { icon: Clock, color: 'amber', label: 'İncelemede', desc: 'Kimlik ve vergi levhası kontrolü yapılıyor.' },
    onayli: { icon: CheckCircle2, color: 'green', label: 'Onaylı', desc: 'Firmanız aktif. Defter mesajı atabilirsiniz.' },
    reddedildi: { icon: XCircle, color: 'red', label: 'Reddedildi', desc: firma.red_sebebi || 'Başvurunuz onaylanmadı.' },
    askida: { icon: Pause, color: 'gray', label: 'Askıda', desc: 'Firmanız geçici olarak askıya alındı.' },
  };
  const dc = durumConfig[firma.durum];
  const DurumIcon = dc.icon;

  return (
    <>
      {/* Mini header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">N</div>
            <span className="font-heading font-bold text-primary-600">Firma Paneli</span>
          </Link>
          <form action="/api/cikis" method="post">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
              <LogOut size={16} /> Çıkış
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Firma özet */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 flex items-center gap-4">
          {firma.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firma.logo_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-2xl">
              {firma.firma_adi.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-heading font-bold text-xl text-gray-900">{firma.firma_adi}</h1>
            <div className="text-sm text-gray-600 mt-1">
              {firma.iller?.ad} • {firma.kategoriler?.ad}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-${dc.color}-50 border border-${dc.color}-200 text-${dc.color}-700`}>
            <DurumIcon size={18} />
            <span className="font-semibold text-sm">{dc.label}</span>
          </div>
        </div>

        {/* Durum mesajı */}
        <div className={`mb-6 p-4 rounded-lg border bg-${dc.color}-50 border-${dc.color}-200 text-${dc.color}-800 text-sm`}>
          {dc.desc}
        </div>

        {/* Onaylı ise defter yazma */}
        {firma.durum === 'onayli' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
                <Plus size={18} className="text-primary-500" /> Yeni Defter Mesajı
              </h2>
              <PanelForm firmaId={firma.id} iller={iller || []} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-primary-500" /> Son Mesajlarım
              </h2>
              {mesajlar && mesajlar.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {mesajlar.map((m: any) => (
                    <div key={m.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            m.tip === 'yuk' ? 'bg-orange-100 text-orange-700' :
                            m.tip === 'bos_arac' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {m.tip === 'yuk' ? 'Yük/İş' : m.tip === 'bos_arac' ? 'Boş Araç' : 'Duyuru'}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            m.onay_durum === 'onayli' ? 'bg-green-100 text-green-700' :
                            m.onay_durum === 'reddedildi' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {m.onay_durum === 'onayli' ? '✓ Yayında' : m.onay_durum === 'reddedildi' ? '✗ Reddedildi' : '⏳ İncelemede'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{zamanOnce(m.created_at)}</span>
                      </div>
                      <p className="text-gray-800 text-sm">{m.mesaj}</p>
                      {m.red_sebebi && (
                        <p className="text-xs text-red-600 mt-1">Red sebebi: {m.red_sebebi}</p>
                      )}
                      {(m.nereden?.ad || m.nereye?.ad) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {m.nereden?.ad || m.nereden_text || '—'} → {m.nereye?.ad || m.nereye_text || '—'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-6">Henüz mesaj yok.</p>
              )}
            </div>
          </div>
        )}

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Durum" value={dc.label} />
          <StatCard label="Görüntülenme" value={firma.goruntulenme || 0} />
          <StatCard label="Toplam Mesaj" value={mesajlar?.length || 0} />
          <StatCard label="Kayıt" value={new Date(firma.created_at).toLocaleDateString('tr-TR')} />
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
