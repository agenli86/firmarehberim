'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminGirisForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHata('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: sifre });
      if (error) throw error;
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setHata(err.message || 'Giriş başarısız');
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
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Şifre</label>
        <input type="password" required value={sifre} onChange={(e) => setSifre(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Giriş...' : 'Admin Girişi'}
      </button>
    </form>
  );
}
