'use client';
import { FormEvent, useState } from 'react'; import {useRouter} from 'next/navigation';
import SiteNav from '@/components/site-nav'; import SiteFooter from '@/components/site-footer'; import {supabaseBrowser} from '@/lib/supabase-browser';
export default function Register(){
 const router=useRouter(); const [f,setF]=useState({name:'',phone:'',email:'',password:'',country:'',language:'English'}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 const set=(k:string,v:string)=>setF(x=>({...x,[k]:v}));
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError(''); const sb=supabaseBrowser();
  const {data,error}=await sb.auth.signUp({email:f.email,password:f.password,options:{data:{full_name:f.name,phone:f.phone,country:f.country,preferred_language:f.language}}});
  if(error){setError(error.message);setBusy(false);return;} if(data.session) router.replace('/dashboard'); else {setError('Account created. Check your email to confirm your account.');setBusy(false);}
 }
 return <><SiteNav/><main className="wrap"><form className="form card" onSubmit={submit}><h1>Create Account</h1><label>Full name<input value={f.name} onChange={e=>set('name',e.target.value)} required maxLength={100}/></label><label>Phone<input value={f.phone} onChange={e=>set('phone',e.target.value)} required maxLength={25}/></label><label>Email<input value={f.email} onChange={e=>set('email',e.target.value)} type="email" required/></label><label>Password<input value={f.password} onChange={e=>set('password',e.target.value)} type="password" minLength={8} required/></label><label>Country<input value={f.country} onChange={e=>set('country',e.target.value)} required/></label><label>Preferred language<select value={f.language} onChange={e=>set('language',e.target.value)}><option>English</option><option>Hindi</option></select></label>{error&&<p role="alert">{error}</p>}<button className="cta" disabled={busy}>{busy?'Creating…':'Register'}</button></form></main><SiteFooter/></>
}
