'use client'
import React from 'react'
import { getClient } from '@/lib/supabaseClient'
type Row = { id:number; content:string; created_at:string }
export default function Memory() {
  const [url, setUrl] = React.useState(''); const [anon, setAnon] = React.useState('')
  const [text, setText] = React.useState(''); const [rows, setRows] = React.useState<Row[]>([])
  React.useEffect(()=>{ const u=localStorage.getItem('ch_supabase_url')||''; const a=localStorage.getItem('ch_supabase_anon')||''; setUrl(u); setAnon(a) }, [])
  async function connect(){ try{ getClient(url,anon); localStorage.setItem('ch_supabase_url',url); localStorage.setItem('ch_supabase_anon',anon); await refresh() } catch(e:any){ alert(e.message||String(e)) } }
  async function save(){ const supa=getClient(url,anon); await supa.from('bff_notes').insert([{content:text.trim()||'memory smoke test'}]); setText(''); await refresh() }
  async function refresh(){ const supa=getClient(url,anon); const { data, error }=await supa.from('bff_notes').select('*').order('created_at',{ascending:false}).limit(50); if(error){ alert(error.message); return } setRows(data as any) }
  return (
    <main style={{padding:24, fontFamily:'ui-sans-serif, system-ui'}}>
      <h1>Memory Smoke Test</h1>
      <div style={{display:'grid', gap:8, maxWidth:640}}>
        <input placeholder="Supabase URL" value={url} onChange={e=>setUrl(e.target.value)} />
        <input placeholder="Supabase anon key" value={anon} onChange={e=>setAnon(e.target.value)} />
        <div style={{display:'flex', gap:8}}>
          <button onClick={connect}>Connect</button>
          <input placeholder="note to save" value={text} onChange={e=>setText(e.target.value)} style={{flex:1}} />
          <button onClick={save}>Save</button>
          <button onClick={refresh}>Refresh</button>
        </div>
        <ul>{rows.map(r=> <li key={r.id}><code>{new Date(r.created_at).toLocaleString()}</code> — {r.content}</li>)}</ul>
      </div>
    </main>
  )
}
