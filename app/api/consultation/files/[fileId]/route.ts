import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase';
import { authorizeBooking } from '@/lib/consultation-auth';
const BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || 'private-files';
export async function GET(req: Request, {params}:{params:Promise<{fileId:string}>}) {
  try {
    const {fileId}=await params;
    const {data:file,error}=await adminDb.from('consultation_files').select('id,booking_id,storage_path,file_name,mime_type').eq('id',fileId).single();
    if(error || !file) return NextResponse.json({error:'File not found'},{status:404});
    await authorizeBooking(req,file.booking_id);
    const {data,error:signedError}=await adminDb.storage.from(BUCKET).createSignedUrl(file.storage_path,300);
    if(signedError) throw signedError;
    return NextResponse.json({url:data.signedUrl,file:{id:file.id,fileName:file.file_name,mimeType:file.mime_type}});
  } catch(e:any) { return NextResponse.json({error:e.message||'Unable to create download link'},{status:e.message==='AUTH_REQUIRED'?401:403}); }
}
