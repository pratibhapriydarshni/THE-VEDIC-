const required = ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','RAZORPAY_WEBHOOK_SECRET','CRON_SECRET'];
const missing = required.filter(k => !process.env[k]);
console.log(JSON.stringify({ok: missing.length===0, missing}, null, 2));
process.exit(missing.length ? 1 : 0);
