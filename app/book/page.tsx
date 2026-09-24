'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Service={id:string;name:string;duration_minutes:number;price_inr:number;price_usd:number};

declare global { interface Window { Razorpay:any } }

export default function Book(){
 const router=useRouter();
 const [services,setServices]=useState<Service[]>([]); const [serviceId,setServiceId]=useState('');
 const [language,setLanguage]=useState('English'); const [mode,setMode]=useState('Chat'); const [date,setDate]=useState(''); const [slots,setSlots]=useState<string[]>([]); const [slot,setSlot]=useState('');
 const [form,setForm]=useState({name:'',phone:'',email:'',dob:'',tob:'',pob:'',current_place:'',purpose:''});
 const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 const service=useMemo(()=>services.find(s=>s.id===serviceId),[services,serviceId]);
 useEffect(()=>{fetch('/api/services').then(r=>r.json()).then(j=>{const x=j.services||[];setServices(x);if(x[0])setServiceId(x[0].id)}).catch(()=>setError('Unable to load services.'));},[]);
 useEffect(()=>{if(!date||!serviceId)return;setSlot('');fetch(`/api/booking/slots?date=${date}&service_id=${serviceId}`).then(r=>r.json()).then(j=>setSlots(j.slots||[])).catch(()=>setSlots([]));},[date,serviceId]);
 useEffect(()=>{(async()=>{const {data:{session}}=await supabaseBrowser().auth.getSession(); if(session?.user){setForm(f=>({...f,email:session.user.email||f.email,name:(session.user.user_metadata?.full_name||f.name),phone:(session.user.user_metadata?.phone||f.phone)}));}})();},[]);
 function set(k:string,v:string){setForm(f=>({...f,[k]:v}));}
 async function submit(e:FormEvent){e.preventDefault();setError('');if(!service||!slot){setError('Please select a service and time slot.');return;}setBusy(true);
   const sb=supabaseBrowser(); const {data:{session}}=await sb.auth.getSession(); if(!session){router.push('/login?next=/book');return;}
   try{
    const bres=await fetch('/api/booking/create',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({...form,service_id:service.id,language,mode,start_at:slot})});
    const bj=await bres.json(); if(!bres.ok) throw new Error(bj.error||'Could not create booking.');
    const ores=await fetch('/api/payments/razorpay/order',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({booking_id:bj.booking.id})});
    const oj=await ores.json(); if(!ores.ok) throw new Error(oj.error||'Could not start payment.');
    if(!window.Razorpay) throw new Error('Payment checkout is unavailable. Please try again.');
    const rz=new window.Razorpay({key:oj.key_id,order_id:oj.order_id,amount:oj.amount,currency:oj.currency,name:'THE VEDIC ASTRO',description:`${service.name} consultation`,prefill:{name:form.name,email:form.email,contact:form.phone},handler:async (response:any)=>{
      const vr=await fetch('/api/payments/razorpay/verify',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({booking_id:bj.booking.id,...response})});
      const vj=await vr.json(); if(!vr.ok){setError(vj.error||'Payment verification failed.');setBusy(false);return;} router.replace('/dashboard');
    },modal:{ondismiss:()=>setBusy(false)}}); rz.open();
   }catch(err){setError(err instanceof Error?err.message:'Something went wrong.');setBusy(false);}
 }
 return <><SiteNav/><main className="wrap bookingPage"><form className="form card" onSubmit={submit}><h1>Book Consultation</h1><p className="muted">Service → Language → Mode → Date & Time → Payment → Confirmation</p>
 <label>Service<select value={serviceId} onChange={e=>setServiceId(e.target.value)}>{services.map(s=><option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} min · ₹{s.price_inr}</option>)}</select></label>
 <label>Language<select value={language} onChange={e=>setLanguage(e.target.value)}><option>English</option><option>Hindi</option></select></label>
 <label>Mode<select value={mode} onChange={e=>setMode(e.target.value)}><option>Chat</option><option>Audio</option><option>Video</option></select></label>
 <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
 {date&&<><p className="muted">Available times (India time)</p><div className="grid">{slots.map(s=><button type="button" className={`card ${slot===s?'selected':''}`} key={s} onClick={()=>setSlot(s)}><b>{new Date(s).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</b></button>)}</div></>}
 <label>Full name<input value={form.name} onChange={e=>set('name',e.target.value)} required/></label><label>Phone<input value={form.phone} onChange={e=>set('phone',e.target.value)} required/></label><label>Email<input type="email" value={form.email} onChange={e=>set('email',e.target.value)} required/></label>
 <label>Date of birth<input type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} placeholder="DD/MM/YYYY"/></label><label>Time of birth<input type="time" value={form.tob} onChange={e=>set('tob',e.target.value)} placeholder="HH:MM"/></label><label>Place of birth<input value={form.pob} onChange={e=>set('pob',e.target.value)}/></label><label>Current place<input value={form.current_place} onChange={e=>set('current_place',e.target.value)}/></label><label>Purpose<textarea value={form.purpose} onChange={e=>set('purpose',e.target.value)} maxLength={2000}/></label>
 {service&&<p><b>Pay ₹{service.price_inr}</b> · {service.duration_minutes} minutes</p>}{error&&<p role="alert">{error}</p>}<button className="cta" disabled={busy||!slot}>{busy?'Processing…':'Continue to Secure Payment'}</button><p className="muted">Full payment is required to confirm your consultation.</p>
 </form></main><SiteFooter/><script src="https://checkout.razorpay.com/v1/checkout.js" async /></>;
}
