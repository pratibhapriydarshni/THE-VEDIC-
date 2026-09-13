import { adminDb } from '@/lib/supabase';
import { bearerUser } from '@/lib/auth';
export async function GET(req:Request){
 const user=await bearerUser(req); if(!user)return Response.json({error:'AUTH_REQUIRED'},{status:401});
 const {data,error}=await adminDb.from('bookings').select('id,start_at,duration_minutes,language,mode,status,payment_status,service_id,services(name)').eq('customer_id',user.id).order('start_at',{ascending:true});
 if(error)return Response.json({error:'BOOKINGS_LOAD_FAILED'},{status:500}); return Response.json({bookings:data||[]});
}
