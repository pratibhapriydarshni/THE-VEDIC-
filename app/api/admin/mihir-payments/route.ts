
import { NextResponse } from 'next/server';
import { requireAdmin, apiError } from '@/lib/auth';
import { adminDb } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await requireAdmin(req, true);

    const { data, error } = await adminDb
      .from('mihir_ai_payments')
      .select(
        'id, user_id, amount_inr, upi_utr, status, submitted_at, verified_at, session_started_at'
      )
      .order('submitted_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ payments: data ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAdmin(req, true);

    const body = await req.json();
    const paymentId =
      typeof body.paymentId === 'string' ? body.paymentId : '';
    const decision = body.decision;

    if (!paymentId || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid payment ID or decision.' },
        { status: 400 }
      );
    }

    const { data: payment, error: findError } = await adminDb
      .from('mihir_ai_payments')
      .select('id, status')
      .eq('id', paymentId)
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment request not found.' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'This payment has already been reviewed.' },
        { status: 409 }
      );
    }

    const reviewedAt = new Date().toISOString();

    const update =
      decision === 'approve'
        ? {
            status: 'verified',
            verified_at: reviewedAt,
            verified_by: user.id,
            session_started_at: reviewedAt,
            session_expires_at: null,
          }
        : {
            status: 'rejected',
            verified_at: reviewedAt,
            verified_by: user.id,
          };

    const { data: updated, error: updateError } = await adminDb
      .from('mihir_ai_payments')
      .update(update)
      .eq('id', paymentId)
      .eq('status', 'pending')
      .select('id, status, user_id, session_started_at')
      .maybeSingle();

    if (updateError) throw new Error(updateError.message);

    if (!updated) {
      return NextResponse.json(
        { error: 'This payment was already reviewed. Refresh and check again.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: updated,
      message:
        decision === 'approve'
          ? 'Payment approved. The paid session has started.'
          : 'Payment rejected.',
    });
  } catch (error) {
    return apiError(error);
  }
}
