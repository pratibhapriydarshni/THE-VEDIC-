import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!id || !['archive', 'restore'].includes(body.action)) {
    return NextResponse.json({ error: 'Invalid moderation request' }, { status: 400 });
  }
  // Connect to canonical Supabase admin session, review update and audit log.
  return NextResponse.json({ ok: true, reviewId: id, action: body.action });
}
