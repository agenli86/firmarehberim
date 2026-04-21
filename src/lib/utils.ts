export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
  };
  return text
    .split('')
    .map((c) => trMap[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function zamanOnce(tarih: string): string {
  const fark = Date.now() - new Date(tarih).getTime();
  const dk = Math.floor(fark / 60000);
  if (dk < 1) return 'şimdi';
  if (dk < 60) return `${dk}dk`;
  const saat = Math.floor(dk / 60);
  if (saat < 24) return `${saat}s`;
  const gun = Math.floor(saat / 24);
  if (gun < 30) return `${gun}g`;
  const ay = Math.floor(gun / 30);
  if (ay < 12) return `${ay}ay`;
  return `${Math.floor(ay / 12)}y`;
}

export function katildiTarihi(tarih: string): string {
  const d = new Date(tarih);
  const aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return `${aylar[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTel(tel: string): string {
  const t = tel.replace(/\D/g, '');
  if (t.length === 11 && t.startsWith('0')) {
    return `${t.slice(0,4)} ${t.slice(4,7)} ${t.slice(7,9)} ${t.slice(9)}`;
  }
  return tel;
}

export function maskTel(tel: string): string {
  const t = tel.replace(/\D/g, '');
  if (t.length < 7) return '*** *** ** **';
  return `${t.slice(0,4)} *** ** ${t.slice(-2)}`;
}
