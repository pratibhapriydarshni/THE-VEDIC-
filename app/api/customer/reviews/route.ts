import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });

async function userFrom(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data } = await db.auth.getUser(token);
  return data.user ?? null;
}

export async function POST(request: NextRequest) {
  const user = await userFrom(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const body = await request.json();
  const bookingId = String(body.bookingId ?? '');
  const rating = Number(body.rating);
  const reviewText = typeof body.reviewText === 'string' ? body.reviewText.trim() : '';
  if (!bookingId || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Booking and a rating from 1 to 5 are required' }, { status: 400 });
  if (reviewText.length > 2000) return NextResponse.json({ error: 'Review is too long' }, { status: 400 });
  const { data: booking } = await db.from('bookings').select('id,customer_id,status,consultation_status').eq('id', bookingId).single();
  if (!booking || booking.customer_id !== user.id) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  const status = `${booking.status ?? ''} ${booking.consultation_status ?? ''}`.toLowerCase();
  if (!status.includes('completed') && !status.includes('ended')) return NextResponse.json({ error: 'Review is available after the consultation is completed' }, { status: 409 });
  const { data, error } = await db.from('consultation_reviews').upsert({ booking_id: bookingId, customer_id: user.id, rating, review_text: reviewText || null }, { onConflict: 'booking_id' }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ review: data }, { status: 201 });
}
