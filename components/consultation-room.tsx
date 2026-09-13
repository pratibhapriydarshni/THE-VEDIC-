'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Room, RoomEvent, Track, RemoteTrack, LocalTrackPublication } from 'livekit-client';

type Message = { id: string; booking_id: string; sender_id: string; message: string; created_at: string; message_type?: string };

type Props = { bookingId: string; accessToken: string; currentUserId?: string };

export default function ConsultationRoom({ bookingId, accessToken, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [roomToken, setRoomToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [livekitUrl, setLivekitUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const roomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

  useEffect(() => {
    let cancelled = false;
    const supabase = supabaseRef.current;
    const channel = supabase.channel(`consultation:${bookingId}`).on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'consultation_messages', filter: `booking_id=eq.${bookingId}`
    }, payload => {
      const msg = payload.new as Message;
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    }).subscribe();

    (async () => {
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const history = await fetch(`/api/consultation/messages?bookingId=${encodeURIComponent(bookingId)}`, { headers });
        const h = await history.json();
        if (!history.ok) throw new Error(h.error || 'Unable to load messages');
        if (!cancelled) setMessages(h.messages || []);
        const fileResponse = await fetch(`/api/consultation/files?bookingId=${encodeURIComponent(bookingId)}`, { headers });
        const fileJson = await fileResponse.json();
        if (fileResponse.ok && !cancelled) setFiles(fileJson.files || []);

        const tokenResponse = await fetch('/api/consultation/token', {
          method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ bookingId })
        });
        const t = await tokenResponse.json();
        if (!tokenResponse.ok) throw new Error(t.error || 'Unable to authorize consultation');
        if (!cancelled) { setRoomToken(t.token); setRoomName(t.room); setLivekitUrl(t.url); }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Unable to open consultation');
      } finally { if (!cancelled) setLoading(false); }
    })();

    return () => { cancelled = true; supabase.removeChannel(channel); roomRef.current?.disconnect(); roomRef.current = null; };
  }, [bookingId, accessToken]);

  useEffect(() => {
    if (!roomToken || !livekitUrl || !videoRef.current) return;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    const attachTrack = (track: RemoteTrack | any) => {
      const element = track.attach();
      element.setAttribute('data-booking-track', bookingId);
      videoRef.current?.appendChild(element);
    };
    const detachTrack = (track: any) => track.detach().forEach((el: HTMLElement) => el.remove());

    room.on(RoomEvent.TrackSubscribed, (track) => attachTrack(track));
    room.on(RoomEvent.TrackUnsubscribed, (track) => detachTrack(track));
    room.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication) => {
      if (publication.track) attachTrack(publication.track);
    });
    room.on(RoomEvent.Disconnected, () => setConnected(false));

    (async () => {
      try {
        await room.connect(livekitUrl, roomToken);
        await room.localParticipant.setMicrophoneEnabled(true);
        await room.localParticipant.setCameraEnabled(true);
        setConnected(true);
      } catch (e: any) { setError(e.message || 'Unable to connect to video room'); }
    })();

    return () => { room.disconnect(); roomRef.current = null; };
  }, [roomToken, livekitUrl, bookingId]);

  async function send() {
    const message = text.trim(); if (!message) return;
    const r = await fetch('/api/consultation/messages', { method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ bookingId, message }) });
    const j = await r.json();
    if (!r.ok) return setError(j.error || 'Message failed');
    setMessages(prev => prev.some(m => m.id === j.message.id) ? prev : [...prev, j.message]);
    setText('');
  }

  async function toggleMic() {
    const next = !micOn; await roomRef.current?.localParticipant.setMicrophoneEnabled(next); setMicOn(next);
  }
  async function toggleCamera() {
    const next = !cameraOn; await roomRef.current?.localParticipant.setCameraEnabled(next); setCameraOn(next);
  }
  function leave() { roomRef.current?.disconnect(); setConnected(false); }

  async function uploadFile(file: File) {
    setUploading(true); setError('');
    try {
      const form = new FormData(); form.append('bookingId', bookingId); form.append('file', file);
      const r = await fetch('/api/consultation/files', { method:'POST', headers:{Authorization:`Bearer ${accessToken}`}, body:form });
      const j = await r.json(); if(!r.ok) throw new Error(j.error||'Upload failed');
      setFiles(prev=>[...prev,j.file]);
    } catch(e:any) { setError(e.message||'Upload failed'); }
    finally { setUploading(false); }
  }
  async function downloadFile(fileId:string) {
    const r=await fetch(`/api/consultation/files/${fileId}`,{headers:{Authorization:`Bearer ${accessToken}`}});
    const j=await r.json(); if(!r.ok) return setError(j.error||'Download failed');
    window.open(j.url,'_blank','noopener,noreferrer');
  }


  return <main style={{maxWidth:1200,margin:'0 auto',padding:24,fontFamily:'system-ui'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
      <div><h1 style={{marginBottom:4}}>Consultation Room</h1><small>Private booking: {bookingId}</small></div>
      <span style={{padding:'6px 10px',borderRadius:999,border:'1px solid #ddd'}}>{connected ? 'Connected' : loading ? 'Connecting…' : 'Not connected'}</span>
    </header>
    {error && <p role="alert" style={{background:'#fff3f3',padding:12,borderRadius:8}}>{error}</p>}
    <section style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginTop:20}}>
      <div>
        <div ref={videoRef} style={{minHeight:430,background:'#111',borderRadius:16,padding:8,display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}} />
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button onClick={toggleMic} disabled={!connected}>{micOn ? 'Mute mic' : 'Unmute mic'}</button>
          <button onClick={toggleCamera} disabled={!connected}>{cameraOn ? 'Turn camera off' : 'Turn camera on'}</button>
          <button onClick={leave} disabled={!connected}>Leave</button>
          <a href="https://wa.me/" target="_blank" rel="noreferrer"><button type="button">Continue on WhatsApp</button></a>
        </div>
      </div>
      <aside style={{border:'1px solid #e5e5e5',borderRadius:16,padding:16,display:'flex',flexDirection:'column',minHeight:500}}>
        <h2 style={{marginTop:0}}>Private chat</h2>
        <div style={{border:'1px solid #eee',borderRadius:10,padding:10,marginBottom:10}}><b>Files</b><div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={uploading} onChange={e=>{const f=e.target.files?.[0]; if(f) uploadFile(f); e.currentTarget.value='';}} /><small>{uploading?'Uploading…':'Max 10 MB'}</small></div>{files.length>0&&<div style={{marginTop:8,display:'flex',flexDirection:'column',gap:4}}>{files.map(f=><button key={f.id} onClick={()=>downloadFile(f.id)} style={{textAlign:'left',background:'none',border:0,padding:4,cursor:'pointer'}}>📎 {f.file_name}</button>)}</div>}</div><div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:8}}>{messages.map(m=><div key={m.id} style={{padding:10,borderRadius:10,background:m.sender_id===currentUserId?'#fff2d8':'#f4f4f4'}}><b>{m.sender_id===currentUserId?'You':'Participant'}</b><div>{m.message}</div></div>)}</div>
        <div style={{display:'flex',gap:8,marginTop:10}}><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}} placeholder="Type your message…" style={{flex:1,padding:10}}/><button onClick={send}>Send</button></div>
      </aside>
    </section>
  </main>;
}
