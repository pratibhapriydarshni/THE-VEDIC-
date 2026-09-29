import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { authorizeBooking } from '@/lib/consultation-auth';

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    const a = await authorizeBooking(req, bookingId);

    const mode = String(a.booking.mode || 'chat').toLowerCase();
    const room = `consultation-${bookingId}`;

    // Chat consultation does not need LiveKit.
    if (mode === 'chat') {
      return NextResponse.json({
        token: '',
        room,
        url: '',
        mode: 'chat',
      });
    }

    // Audio and Video consultations require LiveKit.
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        {
          error: 'LIVEKIT_NOT_CONFIGURED',
        },
        {
          status: 500,
        }
      );
    }

    const identity = a.user.id;

    const token = new AccessToken(
      apiKey,
      apiSecret,
      {
        identity,
        name: a.user.email || identity,
        ttl: '1h',
      }
    );

    token.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    return NextResponse.json({
      token: await token.toJwt(),
      room,
      url: livekitUrl,
      mode,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message || 'token failed',
      },
      {
        status:
          e.message === 'AUTH_REQUIRED'
            ? 401
            : e.message === 'FORBIDDEN'
            ? 403
            : 400,
      }
    );
  }
}