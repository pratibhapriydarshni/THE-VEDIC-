import { z } from 'zod';
import { adminDb } from '@/lib/supabase';
import { bearerUser } from '@/lib/auth';
import { fitsWorkingHours, isSameIstDay, isValidTenMinuteSlot } from '@/lib/booking';

const schema = z.object({
  service_id: z.string().uuid(), language: z.enum(['Hindi','English']), mode: z.enum(['Chat','Audio','Video']),
  start_at: z.string().datetime(), name: z.string().min(2).max(100), phone: z.string().min(7).max(25),
  email: z.string().email().max(200), dob: z.string().max(20).optional(), tob: z.string().max(20).optional(),
  pob: z.string().max(200).optional(), current_place: z.string().max(200).optional(), purpose: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const user = await bearerUser(req);
  if (!user) return Response.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'INVALID_REQUEST', details: parsed.error.flatten() }, { status: 400 });
  const b = parsed.data;
  const start = new Date(b.start_at);
  const { data: service } = await adminDb.from('services').select('id,name,price_inr,price_usd,duration_minutes,enabled').eq('id', b.service_id).eq('enabled', true).single();
  if (!service) return Response.json({ error: 'SERVICE_NOT_FOUND' }, { status: 404 });
  const duration = Number(service.duration_minutes);
  if (![30,45].includes(duration) || !fitsWorkingHours(start, duration) || !isValidTenMinuteSlot(start)) {
    return Response.json({ error: 'INVALID_SLOT' }, { status: 400 });
  }
  if (isSameIstDay(start) && start.getTime() - Date.now() < 3 * 60 * 60 * 1000) {
    return Response.json({ error: 'SAME_DAY_REQUIRES_3_HOURS_NOTICE' }, { status: 400 });
  }
  const { data: booking, error } = await adminDb.from('bookings').insert({
    customer_id: user.id, service_id: service.id, language: b.language, mode: b.mode,
    start_at: start.toISOString(), duration_minutes: duration, name: b.name, phone: b.phone, email: b.email,
    dob: b.dob ?? null, tob: b.tob ?? null, pob: b.pob ?? null, current_place: b.current_place ?? null,
    purpose: b.purpose ?? null, status: 'pending', payment_status: 'pending',
  }).select('*').single();
  if (error) {
    const unavailable = /SLOT_UNAVAILABLE|duplicate|overlap/i.test(error.message);
    return Response.json({ error: unavailable ? 'SLOT_UNAVAILABLE' : 'BOOKING_CREATE_FAILED' }, { status: unavailable ? 409 : 500 });
  }
  return Response.json({ booking, amount_inr: Number(service.price_inr), amount_usd: Number(service.price_usd) }, { status: 201 });
}
