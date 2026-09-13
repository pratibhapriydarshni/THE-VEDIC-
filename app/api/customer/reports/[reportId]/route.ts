import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
const BUCKET = process.env.SUPABASE_PRIVATE_BUCKET ?? 'private-files';

export async function GET(request: NextRequest, { params }: { params: { reportId: string } }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { data: auth } = await db.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { data: report } = await db.from('consultation_reports').select('id,customer_id,storage_path,file_name,mime_type').eq('id', params.reportId).single();
  if (!report || report.customer_id !== auth.user.id) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(report.storage_path, 300, { download: report.file_name });
  if (error || !data?.signedUrl) return NextResponse.json({ error: error?.message ?? 'Unable to create download link' }, { status: 400 });
  return NextResponse.json({ url: data.signedUrl, fileName: report.file_name, mimeType: report.mime_type });
}
