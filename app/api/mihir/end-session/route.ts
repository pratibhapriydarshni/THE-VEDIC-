
import { NextResponse } from 'next/server';
import { bearerUser } from '@/lib/auth';
import { adminDb } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const user = await bearerUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to use Mihir AI.' },
        { status: 401 }
      );
    }

    const { data: session, error: findError } = await adminDb
      .from('mihir_ai_payments')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .not('session_started_at', 'is', null)
      .is('session_ended_at', null)
      .order('session_started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('Mihir AI session lookup failed:', findError.message);
      return NextResponse.json(
        { error: 'Unable to find your active session.' },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'No active paid session was found.' },
        { status: 404 }
      );
    }

    const { data: endedSession, error: updateError } = await adminDb
      .from('mihir_ai_payments')
      .update({ session_ended_at: new Date().toISOString() })
      .eq('id', session.id)
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .is('session_ended_at', null)
      .select('id, session_ended_at')
      .maybeSingle();

    if (updateError) {
      console.error('Mihir AI session ending failed:', updateError.message);
      return NextResponse.json(
        { error: 'Unable to end your session. Please try again.' },
        { status: 500 }
      );
    }

    if (!endedSession) {
      return NextResponse.json(
        { error: 'Your session has already ended. Please refresh the page.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your Mihir AI paid session has ended.',
      sessionEndedAt: endedSession.session_ended_at,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Please log in to use Mihir AI.' },
        { status: 401 }
      );
    }

    console.error('Mihir AI end-session error:', error);

    return NextResponse.json(
      { error: 'Unable to end your session. Please try again.' },
      { status: 500 }
    );
  }
}
