import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function checkAdmin() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === 'admin@admin.com';
}

export async function PATCH(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const body = await req.json();
  delete body.id;
  delete body.created_at;
  delete body.updated_at;
  const admin = createAdminClient();
  const { error } = await admin.from('site_settings').update(body).eq('id', 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
