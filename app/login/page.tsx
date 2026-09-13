'use client';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteNav from '@/components/site-nav'; import SiteFooter from '@/components/site-footer';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Login(){
  const router=useRouter(); const params=useSearchParams();
  const [identifier,setIdentifier]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');const sb=supabaseBrowser();
    const email=identifier.trim();
    const {error}=await sb.auth.signInWithPassword({email,password});
    setBusy(false); if(error){setError(error.message);return;}
    router.replace(params.get('next')||'/dashboard'); router.refresh();
  }
  return <><SiteNav/><main className="wrap"><form className="form card" onSubmit={submit}><h1>Login</h1><label>Email<input value={identifier} onChange={e=>setIdentifier(e.target.value)} type="email" autoComplete="email" required/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required/></label>{error&&<p role="alert">{error}</p>}<button className="cta" disabled={busy}>{busy?'Signing in…':'Login'}</button><p className="muted">New here? <a href="/register">Create an account</a></p></form></main><SiteFooter/></>
}
