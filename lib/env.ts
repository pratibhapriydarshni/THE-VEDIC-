const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY'];
export function assertPublicEnv(){ for(const k of required){ if(!process.env[k]) throw new Error(`Missing environment variable: ${k}`); } }
export function requireEnv(name:string){ const v=process.env[name]; if(!v) throw new Error(`Missing environment variable: ${name}`); return v; }
