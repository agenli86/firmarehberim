import { createAdminClient } from './admin';

/**
 * Firma listesini yorum sayısı ve ortalama puan ile zenginleştirir.
 * N+1 sorgu yerine tek bir batch sorgu yapar.
 */
export async function enrichFirmalarWithStats(firmalar: any[]): Promise<any[]> {
  if (!firmalar || firmalar.length === 0) return [];

  const ids = firmalar.map((f) => f.id);
  const supabase = createAdminClient();
  const { data: yorumlar } = await supabase
    .from('firma_yorumlari')
    .select('firma_id, puan')
    .eq('onaylandi', true)
    .in('firma_id', ids);

  // Map: firma_id -> { sayi, ortalama }
  const stats = new Map<string, { sayi: number; toplam: number }>();
  (yorumlar || []).forEach((y: any) => {
    const cur = stats.get(y.firma_id) || { sayi: 0, toplam: 0 };
    cur.sayi += 1;
    cur.toplam += y.puan;
    stats.set(y.firma_id, cur);
  });

  return firmalar.map((f) => {
    const s = stats.get(f.id);
    return {
      ...f,
      yorum_sayisi: s?.sayi || 0,
      yorum_ortalamasi: s ? s.toplam / s.sayi : 0,
    };
  });
}
