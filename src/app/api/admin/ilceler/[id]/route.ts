import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function checkAdmin() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === 'admin@admin.com';
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const body = await req.json();
  const admin = createAdminClient();
  const { error } = await admin.from('ilceler').update(body).eq('id', parseInt(params.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const admin = createAdminClient();
  const { error } = await admin.from('ilceler').delete().eq('id', parseInt(params.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
