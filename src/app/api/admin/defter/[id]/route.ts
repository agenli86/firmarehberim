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
  const { error } = await admin.from('defter_mesajlari').update(body).eq('id', parseInt(params.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE - URL'de ?hard=true varsa kalıcı sil, yoksa silindi=true yap
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const admin = createAdminClient();
  const url = new URL(req.url);
  const hard = url.searchParams.get('hard') === 'true';

  // Mesaj silinmişse hard delete, yoksa soft delete
  const { data: mesaj } = await admin.from('defter_mesajlari').select('silindi').eq('id', parseInt(params.id)).single();

  if (hard || mesaj?.silindi) {
    // Kalıcı sil
    const { error } = await admin.from('defter_mesajlari').delete().eq('id', parseInt(params.id));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    // Soft delete
    const { error } = await admin.from('defter_mesajlari').update({ silindi: true }).eq('id', parseInt(params.id));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
