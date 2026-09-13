'use client';
import { useEffect, useState } from 'react';

type Report = { id:string; booking_id:string; title:string; file_name:string; mime_type?:string|null; size_bytes?:number|null; created_at:string };

export default function CustomerPostConsultation({ accessToken, bookingId }: { accessToken:string; bookingId:string }) {
  const [reports,setReports]=useState<Report[]>([]); const [rating,setRating]=useState(0); const [text,setText]=useState(''); const [message,setMessage]=useState('');
  useEffect(()=>{ fetch('/api/customer/reports',{headers:{Authorization:`Bearer ${accessToken}`}}).then(r=>r.json()).then(x=>setReports((x.reports??[]).filter((r:Report)=>r.booking_id===bookingId))).catch(()=>{}); },[accessToken,bookingId]);
  async function download(id:string){ const r=await fetch(`/api/customer/reports/${id}`,{headers:{Authorization:`Bearer ${accessToken}`}}); const x=await r.json(); if(r.ok&&x.url) window.open(x.url,'_blank','noopener,noreferrer'); else setMessage(x.error??'Download failed'); }
  async function submit(){ setMessage(''); const r=await fetch('/api/customer/reviews',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${accessToken}`},body:JSON.stringify({bookingId,rating,reviewText:text})}); const x=await r.json(); setMessage(r.ok?'Thank you for your private review.':x.error??'Could not submit review'); }
  return <section style={{display:'grid',gap:20}}>
    <div><h2>Your consultation report</h2>{reports.length===0?<p>No report has been uploaded yet.</p>:reports.map(r=><div key={r.id} style={{display:'flex',justifyContent:'space-between',gap:12,padding:12,border:'1px solid #ddd',borderRadius:10}}><span>{r.title} — {r.file_name}</span><button onClick={()=>download(r.id)}>Download</button></div>)}</div>
    <div><h2>Private review</h2><p>Your rating and written review are visible only to Pt. Deepak/admin.</p><div aria-label="Rating">{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>setRating(n)} aria-label={`${n} stars`} style={{fontSize:24,opacity:rating>=n?1:.35}}>★</button>)}</div><textarea value={text} onChange={e=>setText(e.target.value)} maxLength={2000} placeholder="Share your experience (optional)" rows={4} style={{width:'100%',marginTop:8}}/><button disabled={!rating} onClick={submit}>Submit private review</button>{message&&<p>{message}</p>}</div>
  </section>;
}
