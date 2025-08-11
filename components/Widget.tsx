'use client'
import React from 'react'
import { getClient } from '@/lib/supabaseClient'
function looksLikeSecret(s: string) {
  const longToken = /[A-Za-z0-9_\-]{40,}/
  const commonPrefixes = /(sk-|ghp_|gho_|AIzaSy|AKIA|EAACEdEose0cBA|xoxp-|xoxb-|slack)/i
  return longToken.test(s) || commonPrefixes.test(s)
}
type Message = { role:'user'|'assistant'; content:string; ts:string }
export default function Widget() {
  const [open, setOpen] = React.useState(false)
  const [connected, setConnected] = React.useState('')
  const [url, setUrl] = React.useState(''); const [anon, setAnon] = React.useState('')
  const [text, setText] = React.useState(''); const [log, setLog] = React.useState<Message[]>([])
  const clientRef = React.useRef<ReturnType<typeof getClient> | null>(null)
  React.useEffect(()=>{ const u=localStorage.getItem('ch_supabase_url')||''; const a=localStorage.getItem('ch_supabase_anon')||''; if(u&&a){ setUrl(u); setAnon(a); try{ clientRef.current=getClient(u,a); setConnected(u.replace(/^https?:\/\//,'').split('.')[0]) }catch{} } },[])
  async function connect(){ try{ clientRef.current=getClient(url,anon); localStorage.setItem('ch_supabase_url',url); localStorage.setItem('ch_supabase_anon',anon); setConnected(url.replace(/^https?:\/\//,'').split('.')[0]) }catch(e:any){ alert(e.message||String(e)) } }
  async function send(){ const msg=text.trim(); if(!msg) return; if(looksLikeSecret(msg)){ alert('That looks like a secret/token. Blocked.'); return } setText(''); const ts=new Date().toISOString(); setLog(l=>[{role:'user',content:msg,ts},...l])
    const supa=clientRef.current||getClient(url,anon); const redacted=msg.replace(/[A-Za-z0-9_\-]{40,}/g,'•••redacted•••'); const reply=`Trey here—got you. ${redacted}`
    try{ await supa.from('bff_notes').insert([{content:`user: ${redacted}`}]); await supa.from('bff_notes').insert([{content:`trey: ${reply}`}]); setLog(l=>[{role:'assistant',content:reply,ts:new Date().toISOString()},...l]) }catch(e:any){ alert(e.message||String(e)) } }
  return (<>
    <button onClick={()=>setOpen(o=>!o)} style={{position:'fixed',right:18,bottom:18,zIndex:2147483647,width:64,height:64,borderRadius:999,border:'0',background:'#111',color:'#fff',boxShadow:'0 8px 24px rgba(0,0,0,.25)'}} aria-label="Open Chapterhouse Assistant">CH</button>
    {open&&(<div style={{position:'fixed',right:18,bottom:96,width:480,height:620,background:'#fff',borderRadius:16,boxShadow:'0 16px 48px rgba(0,0,0,.25)',overflow:'hidden',display:'flex',flexDirection:'column',zIndex:2147483647}}>
      <div style={{padding:'12px 16px',background:'#0a0a0a',color:'#fff',fontWeight:600}}>Chapterhouse Assistant {connected&&<span style={{opacity:.7}}>(connected to {connected})</span>}</div>
      <div style={{padding:12,display:'grid',gap:8,borderBottom:'1px solid #eee'}}>
        <input placeholder="Supabase URL" value={url} onChange={e=>setUrl(e.target.value)} />
        <input placeholder="Supabase anon key" value={anon} onChange={e=>setAnon(e.target.value)} />
        <button onClick={connect} style={{padding:'8px 10px'}}>Connect</button>
      </div>
      <div style={{flex:'1 1 auto',padding:12,overflow:'auto',background:'#fafafa'}}>{log.length===0&&<div style={{opacity:.6}}>No messages yet.</div>}
        {log.map((m,i)=>(<div key={i} style={{marginBottom:8}}><div style={{fontSize:12,opacity:.5}}>{new Date(m.ts).toLocaleString()}</div><div><b>{m.role==='user'?'you':'trey'}:</b> {m.content}</div></div>))}
      </div>
      <div style={{display:'flex',gap:8,padding:12,borderTop:'1px solid #eee'}}>
        <input placeholder="Type a message" value={text} onChange={e=>setText(e.target.value)} style={{flex:'1 1 auto'}} onKeyDown={e=>{if(e.key==='Enter') send()}} />
        <button onClick={send} style={{padding:'8px 10px'}}>Send</button>
      </div>
    </div>)}
  </>)
}
