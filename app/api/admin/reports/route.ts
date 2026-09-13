import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const BUCKET = process.env.SUPABASE_PRIVATE_BUCKET ?? 'private-files';

async function requireAdmin(request: NextRequest) {
  const auth = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return null;
  const { data } = await supabase.auth.getUser(auth);
  if (!data.user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
  return profile?.role === 'super_admin' || profile?.role === 'staff_admin' ? data.user : null;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const body = await request.json();
  const { bookingId, title, storagePath, fileName, mimeType, sizeBytes } = body;
  if (!bookingId || !title || !storagePath || !fileName) return NextResponse.json({ error: 'Missing report fields' }, { status: 400 });

  const { data: booking } = await supabase.from('bookings').select('id, customer_id').eq('id', bookingId).single();
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const { data, error } = await supabase.from('consultation_reports').insert({
    booking_id: bookingId, customer_id: booking.customer_id, uploaded_by: admin.id,
    title, storage_path: storagePath, file_name: fileName, mime_type: mimeType ?? null,
    size_bytes: sizeBytes ?? null
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ report: data }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const bookingId = new URL(request.url).searchParams.get('bookingId');
  let query = supabase.from('consultation_reports').select('*').order('created_at', { ascending: false });
  if (bookingId) query = query.eq('booking_id', bookingId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reports: data });
}
