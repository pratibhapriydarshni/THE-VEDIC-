import {adminDb} from '@/lib/supabase';
export async function GET(){const {data,error}=await adminDb.from('services').select('*').eq('enabled',true).order('sort_order').order('name'); if(error)return Response.json({error:error.message},{status:500}); return Response.json({services:data||[]});}
