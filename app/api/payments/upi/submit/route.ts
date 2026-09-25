import { z } from 'zod';
import { adminDb } from '@/lib/supabase';
import { bearerUser } from '@/lib/auth';

const schema = z.object({
  booking_id: z.string().uuid(),
  utr: z
    .string()
    .trim()
    .min(6)
    .max(50)
    .regex(/^[A-Za-z0-9]+$/, 'INVALID_UTR'),
});

export async function POST(req: Request) {
  const user = await bearerUser(req);

  if (!user) {
    return Response.json(
      { error: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const parsed = schema.safeParse(
    await req.json().catch(() => null)
  );

  if (!parsed.success) {
    return Response.json(
      {
        error: 'INVALID_REQUEST',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const bookingId = parsed.data.booking_id;
  const utr = parsed.data.utr.toUpperCase();

  const { data: booking, error: bookingError } =
    await adminDb
      .from('bookings')
      .select('id,customer_id,status,payment_status')
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .single();

  if (bookingError || !booking) {
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

  if (booking.status === 'cancelled') {
    return Response.json(
      { error: 'BOOKING_CANCELLED' },
      { status: 409 }
    );
  }

  const { data: existing } = await adminDb
    .from('bookings')
    .select('id')
    .eq('upi_utr', utr)
    .maybeSingle();

  if (existing && existing.id !== bookingId) {
    return Response.json(
      { error: 'UTR_ALREADY_USED' },
      { status: 409 }
    );
  }

  const { data: updated, error } = await adminDb
    .from('bookings')
    .update({
      payment_method: 'upi_manual',
      upi_utr: utr,
      payment_status: 'verification_pending',
      payment_submitted_at: new Date().toISOString(),
      payment_verified_at: null,
      payment_verified_by: null,
    })
    .eq('id', bookingId)
    .eq('customer_id', user.id)
    .select(
      'id,status,payment_status,payment_method,upi_utr,payment_submitted_at'
    )
    .single();

  if (error) {
    const duplicate =
      error.code === '23505' ||
      /duplicate|unique/i.test(error.message);

    return Response.json(
      {
        error: duplicate
          ? 'UTR_ALREADY_USED'
          : 'PAYMENT_SUBMISSION_FAILED',
      },
      { status: duplicate ? 409 : 500 }
    );
  }

  return Response.json({
    ok: true,
    booking: updated,
    message: 'PAYMENT_VERIFICATION_PENDING',
  });
}