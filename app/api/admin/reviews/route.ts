import { NextRequest, NextResponse } from 'next/server';

// V47 contract: replace getAdminContext() with the canonical Supabase SSR session helper.
// Staff and Super Admin may read private reviews; public clients must never use this route.
export async function GET(req: NextRequest) {
  void req;
  return NextResponse.json({
    ok: true,
    scope: 'admin-private-reviews',
    note: 'Connect to canonical Supabase admin session + reviews table.'
  });
}
