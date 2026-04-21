import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function checkAdmin() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === 'admin@admin.com';
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const body = await req.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from('defter_mesajlari').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
