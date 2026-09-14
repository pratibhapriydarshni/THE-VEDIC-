import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function admin(request: NextRequest) {
  const t = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!t) return null;

  const { data } = await supabase.auth.getUser(t);
  if (!data.user) return null;

  const { data: p } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  return p?.role === 'super_admin' || p?.role === 'staff_admin'
    ? data.user
    : null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const u = await admin(request);

  if (!u) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  const { reportId } = await params;

  const { data: r } = await supabase
    .from('consultation_reports')
    .select('storage_path')
    .eq('id', reportId)
    .single();

  if (!r) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  await supabase.storage
    .from(process.env.SUPABASE_PRIVATE_BUCKET ?? 'private-files')
    .remove([r.storage_path]);

  const { error } = await supabase
    .from('consultation_reports')
    .delete()
    .eq('id', reportId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}