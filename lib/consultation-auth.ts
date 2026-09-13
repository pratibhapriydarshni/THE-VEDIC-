import { createClient } from '@supabase/supabase-js';
import { adminDb } from './supabase';
export async function authorizeBooking(req: Request, bookingId: string) {
  const h=req.headers.get('authorization')||''; const token=h.startsWith('Bearer ')?h.slice(7):'';
  if(!token) throw new Error('AUTH_REQUIRED');
  const userDb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const {data:{user}}=await userDb.auth.getUser(token); if(!user) throw new Error('AUTH_REQUIRED');
  const {data:b}=await adminDb.from('bookings').select('id,customer_id,status,payment_status,scheduled_start,scheduled_end').eq('id',bookingId).single();
  if(!b) throw new Error('BOOKING_NOT_FOUND');
  const {data:profile}=await adminDb.from('profiles').select('role').eq('id',user.id).maybeSingle();
  const admin=['super_admin','staff_admin'].includes(profile?.role||'');
  if(!admin && b.customer_id!==user.id) throw new Error('FORBIDDEN');
  if(!['confirmed','paid'].includes(b.status) && b.payment_status!=='paid') throw new Error('PAYMENT_REQUIRED');
  return {user,booking:b,admin};
}
