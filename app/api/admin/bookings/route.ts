import { adminDb } from '@/lib/supabase';
import { requireAdmin, apiError } from '@/lib/auth';

function whatsappNumber(phone: string) {
  let n = phone.replace(/\D/g, '');

  // Indian 10-digit number -> add 91
  if (n.length === 10) n = `91${n}`;

  // 0XXXXXXXXXX -> 91XXXXXXXXXX
  if (n.length === 11 && n.startsWith('0')) {
    n = `91${n.slice(1)}`;
  }

  return n;
}

function formatDateIst(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTimeIst(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value)) + ' IST';
}

async function sendWhatsAppTemplate(
  req: Request,
  to: string,
  template: string,
  values: string[]
) {
  const secret = process.env.WHATSAPP_INTERNAL_SECRET;

  if (!secret) {
    console.error('WHATSAPP_INTERNAL_SECRET missing');
    return;
  }

  try {
    const response = await fetch(
      new URL('/api/whatsapp/send', req.url),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': secret,
        },
        body: JSON.stringify({
          to: whatsappNumber(to),
          template,

          // If Meta shows template language as English (US),
          // change this to en_US
          language: 'en',

          components: [
            {
              type: 'body',
              parameters: values.map((text) => ({
                type: 'text',
                text,
              })),
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const result = await response.text();
      console.error(
        `WhatsApp ${template} failed:`,
        response.status,
        result
      );
    }
  } catch (error) {
    console.error(`WhatsApp ${template} error:`, error);
  }
}

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
            service_id,
            name,
            phone,
            start_at,
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

      /*
       * LOAD SERVICE DETAILS FOR WHATSAPP
       */
      const { data: service } = await adminDb
        .from('services')
        .select('name,price_inr')
        .eq('id', booking.service_id)
        .single();

      if (service && booking.phone) {
        const customerName = booking.name || 'Customer';
        const serviceName = service.name || 'Consultation';
        const amount = `₹${Number(service.price_inr)}`;
        const date = formatDateIst(booking.start_at);
        const time = formatTimeIst(booking.start_at);

        /*
         * PAYMENT RECEIVED
         * {{1}} Name
         * {{2}} Service
         * {{3}} Amount
         * {{4}} Booking Date
         */
        await sendWhatsAppTemplate(
          req,
          booking.phone,
          'payment_received',
          [
            customerName,
            serviceName,
            amount,
            date,
          ]
        );

        /*
         * BOOKING CONFIRMATION
         * {{1}} Name
         * {{2}} Service
         * {{3}} Date
         * {{4}} Time
         */
        await sendWhatsAppTemplate(
          req,
          booking.phone,
          'booking_confirmation',
          [
            customerName,
            serviceName,
            date,
            time,
          ]
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