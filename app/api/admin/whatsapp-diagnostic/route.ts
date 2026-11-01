import { requireAdmin, apiError } from '@/lib/auth';
import { requireEnv } from '@/lib/env';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const token = requireEnv('WHATSAPP_ACCESS_TOKEN');
    const phoneId = requireEnv('WHATSAPP_PHONE_NUMBER_ID');

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${phoneId}?fields=display_phone_number,verified_name`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    const result = await response.json();

    return Response.json(
      {
        ok: response.ok,
        meta_status: response.status,
        result,
      },
      { status: response.ok ? 200 : 502 }
    );
  } catch (error) {
    return apiError(error);
  }
}