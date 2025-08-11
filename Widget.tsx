'use client'
import React from 'react'
import { getClient } from '@/lib/supabaseClient'

type Message = { role: 'user'|'assistant'; content: string; ts?: string };

function looksLikeSecret(s: string){
  const longToken = /[A-Za-z0-9_\-]{40,}/;
  const commonPrefixes = /(sk-|ghp_|gho_|AIzaSy|AKIA|EAACEdEose0cBA|xoxp-|xoxb-|slack)/i;
  return longToken.test(s) || commonPrefixes.test(s);
}

export default function Widget(){
  const [url, setUrl] = React.useState('');
  const [anon, setAnon] = React.useState('');
  const [text, setText] = React.useState('');
  const [log, setLog] = React.useState<Message[]>([]);
  const clientRef = React.useRef<ReturnType<typeof getClient> | null>(null);
  const [connected, setConnected] = React.useState<string | null>(null);

  React.useEffect(()=>{
    const u = localStorage.getItem('ch_supabase_url') || '';
    const a = localStorage.getItem('ch_supabase_anon') || '';
    if(u && a){
      setUrl(u); setAnon(a);
      try{
        clientRef.current = getClient(u, a);
        setConnected(u.replace(/^https?:\/\//,'').split('.')[0]);
      }catch{}
    }
  },[]);

  async function connect(){
    try{
      clientRef.current = getClient(url, anon);
      localStorage.setItem('ch_supabase_url', url);
      localStorage.setItem('ch_supabase_anon', anon);
      setConnected(url.replace(/^https?:\/\//,'').split('.')[0]);
    }catch(e: any){
      alert(e.message || String(e));
    }
  }

  async function send(){
    const msg = text.trim();
    if(!msg) return;
    if(looksLikeSecret(msg)){ alert('That looks like a secret/token. Blocked.'); return; }
    setText('');
    const ts = new Date().toISOString();
    setLog(l => [{ role: 'user', content: msg, ts }, ...l ]);
    const redacted = msg.replace(/[A-Za-z0-9_\-]{40,}/g,'•••redacted•••');
    const reply = `Trey here—got you. ${redacted}`;
    setLog(l => [{ role: 'assistant', content: reply, ts }, ...l ]);
  }

  return (
    <div style={{padding:16,border:'1px solid #eee',borderRadius:12}}>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <input style={{flex:1}} placeholder="https://<ref>.supabase.co" value={url} onChange={e=>setUrl(e.target.value)} />
        <input style={{flex:2}} placeholder="anon key" value={anon} onChange={e=>setAnon(e.target.value)} />
        <button onClick={connect}>Connect</button>
      </div>
      <div style={{fontSize:12,opacity:.6,marginBottom:8}}>
        {connected ? `Connected: ${connected}` : 'Not connected'}
      </div>
      <div style={{display:'flex',gap:8}}>
        <input style={{flex:1}} placeholder="Say something…" value={text} onChange={e=>setText(e.target.value)} />
        <button onClick={send}>Send</button>
      </div>
      <ul style={{marginTop:12,listStyle:'none',padding:0}}>
        {log.map((r,i)=>(<li key={i}><code>{new Date(r.ts||Date.now()).toLocaleString()}</code> — <b>{r.role}:</b> {r.content}</li>))}
      </ul>
    </div>
  );
}
