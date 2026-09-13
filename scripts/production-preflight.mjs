import fs from 'fs';
import path from 'path';

const root = process.cwd();
const requiredFiles = [
  'app/page.tsx','app/book/page.tsx','app/dashboard/page.tsx','app/consultation/[bookingId]/page.tsx',
  'app/api/booking/create/route.ts','app/api/booking/slots/route.ts',
  'app/api/payments/razorpay/order/route.ts','app/api/payments/razorpay/verify/route.ts',
  'app/api/webhooks/razorpay/route.ts','app/api/cron/reminders/route.ts',
  'app/api/health/route.ts','supabase/migration.sql','supabase/v54_production.sql','vercel.json'
];
const missing = requiredFiles.filter(f => !fs.existsSync(path.join(root,f)));
if (missing.length) { console.error(JSON.stringify({ok:false,missing},null,2)); process.exit(1); }
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const forbidden=['NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'];
const env=fs.readFileSync(path.join(root,'.env.example'),'utf8');
const leaked=forbidden.filter(k=>env.includes(k));
if(leaked.length){console.error(JSON.stringify({ok:false,reason:'service-role key must never be public',leaked},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,version:pkg.version,requiredFiles:requiredFiles.length,publicServiceRoleLeak:false},null,2));
