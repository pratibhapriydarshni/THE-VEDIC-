import crypto from 'crypto';
export function timingSafeEqualHex(a:string,b:string){ const aa=Buffer.from(a,'hex'), bb=Buffer.from(b,'hex'); return aa.length===bb.length && crypto.timingSafeEqual(aa,bb); }
export function hmacSha256(secret:string, body:string){ return crypto.createHmac('sha256',secret).update(body).digest('hex'); }
export function safeCron(request:Request){ const expected=process.env.CRON_SECRET; if(!expected) return false; return request.headers.get('authorization')===`Bearer ${expected}` || request.headers.get('x-cron-secret')===expected; }
