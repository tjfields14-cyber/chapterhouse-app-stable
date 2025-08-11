import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);

  const submit=async(e)=>{
    e.preventDefault(); setMsg(""); setBusy(true);
    try{
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if(error) throw new Error(error.message);
      window.location.href="/admin/dashboard";
    }catch(err){ setMsg(String(err.message||err)); }
    finally{ setBusy(false); }
  };

  return (
    <main style={{padding:24,maxWidth:520,margin:"0 auto",fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>Admin Login</h1>
      <form onSubmit={submit} style={{display:"grid",gap:8}}>
        <input type="email" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        <button disabled={busy} type="submit">{busy?"Working…":"Sign in"}</button>
      </form>
      {msg && <p style={{marginTop:12,color:"#ef4444"}}>{msg}</p>}
    </main>
  );
}
