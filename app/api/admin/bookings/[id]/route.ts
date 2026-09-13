import { z } from 'zod';
import { adminDb } from '@/lib/supabase';
import { requireAdmin, apiError } from '@/lib/auth';
const schema = z.object({ action: z.enum(['reschedule','cancel','confirm','mark_paid','block']), start_at: z.string().datetime().optional() });
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { role } = await requireAdmin(req); const { id } = await params; const b = schema.parse(await req.json());
    if (b.action === 'reschedule' && !b.start_at) return Response.json({ error:'START_AT_REQUIRED' }, {status:400});
    const patch: Record<string, unknown> = {};
    if (b.action === 'reschedule') patch.start_at = b.start_at;
    if (b.action === 'cancel') patch.status = 'cancelled';
    if (b.action === 'confirm') patch.status = 'confirmed';
    if (b.action === 'mark_paid') { patch.payment_status = 'paid'; patch.status = 'confirmed'; }
    if (b.action === 'block') patch.status = 'blocked';
    const { data, error } = await adminDb.from('bookings').update(patch).eq('id', id).select('*').single();
    if (error) throw new Error(error.message); return Response.json({ booking:data, acted_by:role });
  } catch(e) { return apiError(e); }
}
