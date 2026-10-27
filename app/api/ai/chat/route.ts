
import { NextResponse } from 'next/server';
import { bearerUser } from '@/lib/auth';
import { adminDb } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let reservedUserId: string | null = null;

  try {
    // 1. Require a valid logged-in Supabase user.
    const user = await bearerUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to use Mihir AI.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const message = String(body.message || '').trim();
    const image = body.image;

    if (!message && !image) {
      return NextResponse.json(
        { error: 'Please enter a message or upload a palm photo.' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long. Maximum 2000 characters.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (
      image &&
      (
        typeof image.data !== 'string' ||
        !allowedTypes.includes(image.mimeType) ||
        image.data.length > 4_200_000 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid image. Upload a JPG, PNG, or WebP under 3 MB.' },
        { status: 400 }
      );
    }

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: 'AI service is not configured.' },
        { status: 500 }
      );
    }

    // 2. Check whether this user has an approved, unended paid session.
    const { data: activeSession, error: sessionError } = await adminDb
      .from('mihir_ai_payments')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .not('session_started_at', 'is', null)
      .is('session_ended_at', null)
      .order('session_started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      console.error('Mihir AI session check failed:', sessionError.message);

      return NextResponse.json(
        { error: 'Unable to check your session. Please try again.' },
        { status: 500 }
      );
    }

    const isPaidSession = Boolean(activeSession);
    let freeMessagesUsed: number | null = null;

    // 3. Only reserve a free message if there is no active paid session.
    if (!isPaidSession) {
      const { data: used, error: usageError } = await adminDb.rpc(
        'mihir_ai_use_free_message',
        { p_user_id: user.id }
      );

      if (usageError) {
        console.error(
          'Mihir AI usage reservation failed:',
          usageError.message
        );

        return NextResponse.json(
          { error: 'Unable to check your free messages. Please try again.' },
          { status: 500 }
        );
      }

      if (typeof used !== 'number' || used < 1 || used > 5) {
        return NextResponse.json(
          {
            error: 'FREE_LIMIT_REACHED',
            message:
              'You have used your five free messages. Please request a ₹99 paid session.',
          },
          { status: 402 }
        );
      }

      freeMessagesUsed = used;
      reservedUserId = user.id;
    }

    // 4. Preserve text chat and palm-photo interpretation.
    const parts: Array<Record<string, unknown>> = [
      {
        text: [
          'You are Mihir AI, the AI astrology guide for THE VEDIC ASTRO.',
          'Be respectful, warm, clear, and helpful.',
          'Explain Vedic astrology and palmistry as cultural and reflective practices, not scientifically guaranteed predictions.',
          'If the user uploads a palm photo, offer a general, non-certain palmistry interpretation based only on visible features.',
          'Do not claim to diagnose health conditions or predict death, accidents, or guaranteed future events from palm lines.',
          'Do not make medical, legal, or financial decisions for users.',
          'Never claim to be a human astrologer.',
          'Reply in the language used by the user when possible.',
          message ||
            'Please offer a general palmistry interpretation of this palm photo.',
        ].join(' '),
      },
    ];

    if (image) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini chat request failed:', response.status);

      if (reservedUserId) {
        await refundFreeMessage(reservedUserId);
        reservedUserId = null;
      }

      return NextResponse.json(
        { error: 'The AI astrologer is temporarily unavailable.' },
        { status: 502 }
      );
    }

    const data = await response.json();

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('')
      .trim();

    if (!reply) {
      if (reservedUserId) {
        await refundFreeMessage(reservedUserId);
        reservedUserId = null;
      }

      return NextResponse.json(
        { error: 'The AI could not generate a reply. Please try again.' },
        { status: 502 }
      );
    }

    // 5. Successful response: a free message is consumed,
    // but paid messages do not use the free-message allowance.
    reservedUserId = null;

    return NextResponse.json({
      reply,
      paidSession: isPaidSession,
      ...(freeMessagesUsed !== null
        ? {
            freeMessagesUsed,
            freeMessagesRemaining: 5 - freeMessagesUsed,
          }
        : {}),
    });
  } catch (error) {
    if (reservedUserId) {
      await refundFreeMessage(reservedUserId);
    }

    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Please log in to use Mihir AI.' },
        { status: 401 }
      );
    }

    console.error('Mihir AI chat request failed:', error);

    return NextResponse.json(
      { error: 'Unable to process your message. Please try again.' },
      { status: 500 }
    );
  }
}

async function refundFreeMessage(userId: string) {
  const { error } = await adminDb.rpc(
    'mihir_ai_refund_free_message',
    { p_user_id: userId }
  );

  if (error) {
    console.error(
      'Mihir AI free-message refund failed:',
      error.message
    );
  }
}
