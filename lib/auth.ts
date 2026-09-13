import { createClient } from '@supabase/supabase-js';
import { adminDb } from './supabase';
export type AdminRole='super_admin'|'staff_admin';
export async function bearerUser(req:Request){
 const h=req.headers.get('authorization')||''; const token=h.startsWith('Bearer ')?h.slice(7):'';
 if(!token) return null;
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user}}=await db.auth.getUser(token); return user||null;
}
export async function requireAdmin(req:Request, superOnly=false){
 const user=await bearerUser(req); if(!user) throw new Error('AUTH_REQUIRED');
 const {data:p}=await adminDb.from('profiles').select('role').eq('id',user.id).maybeSingle();
 const role=p?.role as AdminRole|undefined;
 if(!role || (superOnly && role!=='super_admin')) throw new Error('FORBIDDEN');
 return {user,role};
}
export function apiError(e:unknown){const m=e instanceof Error?e.message:'SERVER_ERROR'; const status=m==='AUTH_REQUIRED'?401:m==='FORBIDDEN'?403:m==='NOT_FOUND'?404:400; return Response.json({error:m},{status});}
