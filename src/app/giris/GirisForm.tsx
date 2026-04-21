'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function GirisForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: sifre });
      if (error) throw error;
      router.push('/panel');
      router.refresh();
    } catch (err: any) {
      setHata(err.message || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hata && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {hata}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Şifre</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            required
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>

      <div className="text-sm text-center text-gray-600 pt-2">
        Henüz kayıtlı değil misiniz?{' '}
        <Link href="/kayit" className="text-primary-600 font-semibold hover:underline">
          Firma Kaydı Oluştur
        </Link>
      </div>
    </form>
  );
}
