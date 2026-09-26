import { requireAdmin, apiError } from '@/lib/auth';
import { generateDailyAI } from '@/lib/daily-ai';

export async function POST(req: Request) {
  try {
    const { user } = await requireAdmin(req);

    const result = await generateDailyAI();

    return Response.json({
      ...result,
      generated_by: user.id,
    });
  } catch (e) {
    return apiError(e);
  }
}