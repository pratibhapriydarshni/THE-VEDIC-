import { adminDb } from '@/lib/supabase';
import { requireAdmin, apiError } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const [
      bookingsResult,
      customersResult,
      pendingPaymentsResult,
      confirmedResult,
    ] = await Promise.all([
      adminDb
        .from('bookings')
        .select('id,status,payment_status,start_at,name')
        .order('start_at', { ascending: false })
        .limit(20),

      adminDb
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer'),

      adminDb
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'verification_pending'),

      adminDb
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'confirmed'),
    ]);

    if (bookingsResult.error) {
      throw new Error(bookingsResult.error.message);
    }

    if (customersResult.error) {
      throw new Error(customersResult.error.message);
    }

    if (pendingPaymentsResult.error) {
      throw new Error(pendingPaymentsResult.error.message);
    }

    if (confirmedResult.error) {
      throw new Error(confirmedResult.error.message);
    }

    return Response.json({
      bookings: bookingsResult.data || [],
      customers: customersResult.count || 0,
      pending_payments: pendingPaymentsResult.count || 0,
      confirmed_bookings: confirmedResult.count || 0,
    });
  } catch (e) {
    return apiError(e);
  }
}