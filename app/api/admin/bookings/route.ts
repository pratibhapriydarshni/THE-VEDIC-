import { adminDb } from '@/lib/supabase';
import { requireAdmin, apiError } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const paymentStatus = url.searchParams.get('payment_status');

    let query = adminDb
      .from('bookings')
      .select(`
        *,
        services (
          name,
          price_inr,
          price_usd
        )
      `)
      .order('start_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return Response.json({
      bookings: data || [],
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();

    if (!body.booking_id) {
      return Response.json(
        { error: 'BOOKING_ID_REQUIRED' },
        { status: 400 }
      );
    }

    /*
     * MANUAL UPI PAYMENT VERIFICATION
     */
    if (body.action === 'verify_payment') {
      const { data: booking, error: loadError } =
        await adminDb
          .from('bookings')
          .select(`
            id,
            status,
            payment_status,
            payment_method,
            upi_utr,
            payment_submitted_at
          `)
          .eq('id', body.booking_id)
          .single();

      if (loadError || !booking) {
        return Response.json(
          { error: 'BOOKING_NOT_FOUND' },
          { status: 404 }
        );
      }

      if (booking.payment_status === 'paid') {
        return Response.json(
          { error: 'ALREADY_PAID' },
          { status: 409 }
        );
      }

      if (
        booking.payment_method !== 'upi_manual' ||
        !booking.upi_utr ||
        !booking.payment_submitted_at
      ) {
        return Response.json(
          { error: 'PAYMENT_NOT_SUBMITTED' },
          { status: 409 }
        );
      }

      const { data: updated, error } =
        await adminDb
          .from('bookings')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_verified_at: new Date().toISOString(),
            payment_verified_by: admin.user.id,
          })
          .eq('id', booking.id)
          .eq('payment_status', 'verification_pending')
          .select('*')
          .maybeSingle();

      if (error) throw new Error(error.message);

      if (!updated) {
        return Response.json(
          { error: 'PAYMENT_STATUS_CHANGED' },
          { status: 409 }
        );
      }

      return Response.json({
        ok: true,
        booking: updated,
      });
    }

    /*
     * REJECT MANUAL UPI SUBMISSION
     */
    if (body.action === 'reject_payment') {
      const { data: booking, error: loadError } =
        await adminDb
          .from('bookings')
          .select('id,payment_status,payment_method,upi_utr')
          .eq('id', body.booking_id)
          .single();

      if (loadError || !booking) {
        return Response.json(
          { error: 'BOOKING_NOT_FOUND' },
          { status: 404 }
        );
      }

      if (
        booking.payment_method !== 'upi_manual' ||
        !booking.upi_utr
      ) {
        return Response.json(
          { error: 'PAYMENT_NOT_SUBMITTED' },
          { status: 409 }
        );
      }

      const { data: updated, error } =
        await adminDb
          .from('bookings')
          .update({
            payment_status: 'rejected',
            payment_verified_at: null,
            payment_verified_by: null,
          })
          .eq('id', booking.id)
          .eq('payment_status', 'verification_pending')
          .select('*')
          .maybeSingle();

      if (error) throw new Error(error.message);

      if (!updated) {
        return Response.json(
          { error: 'PAYMENT_STATUS_CHANGED' },
          { status: 409 }
        );
      }

      return Response.json({
        ok: true,
        booking: updated,
      });
    }

    /*
     * NORMAL ADMIN BOOKING UPDATES
     */
    const patch: Record<string, unknown> = {};

    for (const key of [
      'start_at',
      'status',
      'consultation_status',
    ]) {
      if (key in body) {
        patch[key] = body[key];
      }
    }

    if (body.status === 'cancelled') {
      patch.cancelled_by = admin.user.id;
    }

    if (Object.keys(patch).length === 0) {
      return Response.json(
        { error: 'INVALID_UPDATE' },
        { status: 400 }
      );
    }

    const { data, error } = await adminDb
      .from('bookings')
      .update(patch)
      .eq('id', body.booking_id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    return Response.json({
      booking: data,
    });
  } catch (e) {
    return apiError(e);
  }
}