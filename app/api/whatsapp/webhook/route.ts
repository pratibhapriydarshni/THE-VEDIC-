
import { createHmac, timingSafeEqual } from 'node:crypto';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (
    mode === 'subscribe' &&
    verifyToken &&
    token === verifyToken &&
    challenge
  ) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(req: Request) {
  const appSecret = process.env.META_APP_SECRET;
  const signature = req.headers.get('x-hub-signature-256');

  if (!appSecret || !signature?.startsWith('sha256=')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBody = await req.text();

  const expected = createHmac('sha256', appSecret)
    .update(rawBody)
    .digest();

  let received: Buffer;

  try {
    received = Buffer.from(signature.slice(7), 'hex');
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.object !== 'whatsapp_business_account') {
    return Response.json({ error: 'Invalid object' }, { status: 404 });
  }

  // Incoming messages and status updates are received here.
  // Database storage and automated replies can be added separately.

  return Response.json({ success: true }, { status: 200 });
}
