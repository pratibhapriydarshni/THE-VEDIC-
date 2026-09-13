import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase';
import { authorizeBooking } from '@/lib/consultation-auth';

const BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || 'private-files';
const MAX = 10 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg','image/png','image/webp','application/pdf']);

function safeName(name:string){ return name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,120); }

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bookingId = url.searchParams.get('bookingId');
    if (!bookingId) return NextResponse.json({error:'bookingId required'},{status:400});
    await authorizeBooking(req, bookingId);
    const {data,error}=await adminDb.from('consultation_files').select('id,booking_id,storage_path,file_name,mime_type,created_at').eq('booking_id',bookingId).order('created_at',{ascending:true});
    if(error) throw error;
    return NextResponse.json({files:data||[]});
  } catch(e:any) { return NextResponse.json({error:e.message||'Unable to list files'},{status:e.message==='AUTH_REQUIRED'?401:403}); }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const bookingId = String(form.get('bookingId')||'');
    const file = form.get('file');
    if (!bookingId || !(file instanceof File)) return NextResponse.json({error:'bookingId and file required'},{status:400});
    const auth = await authorizeBooking(req, bookingId);
    if (file.size > MAX) return NextResponse.json({error:'Maximum file size is 10 MB'},{status:413});
    if (!ALLOWED.has(file.type)) return NextResponse.json({error:'Only JPG, PNG, WEBP and PDF files are allowed'},{status:415});
    const path = `consultations/${bookingId}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const {error:uploadError}=await adminDb.storage.from(BUCKET).upload(path,bytes,{contentType:file.type,upsert:false});
    if(uploadError) throw uploadError;
    const {data,error}=await adminDb.from('consultation_files').insert({booking_id:bookingId,storage_path:path,file_name:safeName(file.name),mime_type:file.type,uploaded_by:auth.user.id}).select().single();
    if(error){ await adminDb.storage.from(BUCKET).remove([path]); throw error; }
    return NextResponse.json({file:data},{status:201});
  } catch(e:any) { return NextResponse.json({error:e.message||'File upload failed'},{status:e.message==='AUTH_REQUIRED'?401:403}); }
}
