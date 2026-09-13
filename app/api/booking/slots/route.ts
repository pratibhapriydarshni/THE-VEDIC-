import { adminDb } from '@/lib/supabase';
import { fitsWorkingHours, isSameIstDay, isValidTenMinuteSlot } from '@/lib/booking';

function parseDateOnly(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }
export async function GET(req: Request) {
  const url = new URL(req.url); const date = url.searchParams.get('date'); const serviceId = url.searchParams.get('service_id');
  if (!date || !parseDateOnly(date)) return Response.json({ error: 'INVALID_DATE' }, { status: 400 });
  let duration = Number(url.searchParams.get('duration') || 30);
  if (serviceId) {
    const { data } = await adminDb.from('services').select('duration_minutes').eq('id', serviceId).eq('enabled', true).maybeSingle();
    if (!data) return Response.json({ error: 'SERVICE_NOT_FOUND' }, { status: 404 });
    duration = Number(data.duration_minutes);
  }
  if (![30,45].includes(duration)) return Response.json({ error: 'INVALID_DURATION' }, { status: 400 });
  const startOfDay = new Date(`${date}T00:00:00+05:30`); const endOfDay = new Date(`${date}T23:59:59+05:30`);
  const { data: bookings } = await adminDb.from('bookings').select('start_at,duration_minutes,status').lt('start_at', endOfDay.toISOString()).gte('start_at', startOfDay.toISOString()).in('status',['pending','confirmed','paid']);
  const slots: string[] = [];
  for (let m = 0; m < 24 * 60; m += 10) {
    const start = new Date(startOfDay.getTime() + m * 60000);
    if (!fitsWorkingHours(start, duration) || !isValidTenMinuteSlot(start)) continue;
    if (isSameIstDay(start) && start.getTime() - Date.now() < 3 * 60 * 60 * 1000) continue;
    const end = new Date(start.getTime() + duration * 60000);
    const conflict = (bookings || []).some(b => { const bs = new Date(b.start_at); const be = new Date(bs.getTime() + Number(b.duration_minutes) * 60000); return bs < end && be > start; });
    if (!conflict) slots.push(start.toISOString());
  }
  return Response.json({ slots, duration_minutes: duration, timezone: 'Asia/Kolkata' });
}
