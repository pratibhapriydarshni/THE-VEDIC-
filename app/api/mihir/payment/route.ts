
import { NextResponse } from 'next/server';
import { bearerUser } from '@/lib/auth';
import { adminDb } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const user = await bearerUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to submit your payment.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const utr = String(body.utr || '').trim();

    // Validate the payment reference before saving it.
    if (!/^[A-Za-z0-9]{8,30}$/.test(utr)) {
      return NextResponse.json(
        { error: 'Enter a valid UTR/reference number (8–30 letters or digits).' },
        { status: 400 }
      );
    }

    // Do not create another pending request if the customer
    // already has one or an approved session.
    const { data: existing, error: lookupError } = await adminDb
      .from('mihir_ai_payments')
      .select('id, status, session_expires_at')
      .eq('user_id', user.id)
      .in('status', ['pending', 'verified'])
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (lookupError) {
      console.error('Mihir AI payment lookup failed:', lookupError.message);
      return NextResponse.json(
        { error: 'Unable to check payment status. Please try again.' },
        { status: 500 }
      );
    }

    const activeOrPending = (existing || []).find((payment) => {
      if (payment.status === 'pending') return true;

      // A verified payment without an expiry is treated as an
      // approved session that has not ended yet.
      if (!payment.session_expires_at) return true;

      return new Date(payment.session_expires_at).getTime() > Date.now();
    });

    if (activeOrPending) {
      return NextResponse.json(
        {
          error:
            activeOrPending.status === 'pending'
              ? 'You already have a payment awaiting review.'
              : 'You already have an approved Mihir AI session.',
        },
        { status: 409 }
      );
    }

    const { data: payment, error: insertError } = await adminDb
      .from('mihir_ai_payments')
      .insert({
        user_id: user.id,
        amount_inr: 99,
        upi_utr: utr,
        status: 'pending',
      })
      .select('id, status, submitted_at')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This UTR has already been submitted.' },
          { status: 409 }
        );
      }

      console.error('Mihir AI payment submission failed:', insertError.message);
      return NextResponse.json(
        { error: 'Unable to submit payment details. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment reference submitted. Your session will unlock after admin verification.',
      payment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Please log in to submit your payment.' },
        { status: 401 }
      );
    }

    console.error('Mihir AI payment API failed:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
