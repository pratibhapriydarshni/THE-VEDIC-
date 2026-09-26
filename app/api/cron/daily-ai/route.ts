import { generateDailyAI } from '@/lib/daily-ai';

export async function GET(req: Request) {
  try {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
      return Response.json(
        { error: 'CRON_SECRET_MISSING' },
        { status: 500 }
      );
    }

    const auth = req.headers.get('authorization');

    if (auth !== `Bearer ${secret}`) {
      return Response.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const result = await generateDailyAI();

    return Response.json({
      ...result,
      triggered_by: 'vercel-cron',
    });
  } catch (e) {
    console.error('Daily AI cron error:', e);

    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : 'DAILY_AI_CRON_FAILED',
      },
      { status: 500 }
    );
  }
}