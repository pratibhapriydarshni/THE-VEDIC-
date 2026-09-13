import { adminDb } from '@/lib/supabase';
export async function GET() {
  const started = Date.now();
  const { error } = await adminDb.from('services').select('id').limit(1);
  if (error) return Response.json({ ok: false, database: false, error: 'DATABASE_UNAVAILABLE' }, { status: 503 });
  return Response.json({ ok: true, database: true, latency_ms: Date.now() - started, version: '0.52.0' });
}
