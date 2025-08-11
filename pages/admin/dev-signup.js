import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DevSignup(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);

  const submit=async(e)=>{
    e.preventDefault(); setMsg(""); setBusy(true);
    try{
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/admin/login" }
      });
      if(error) throw new Error(error.message);

      const r = await fetch("/api/admin/allowlist",{
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email })
      });
      const j = await r.json();
      if(!r.ok) throw new Error(j.error||"Allowlist failed");

      setMsg("Admin created & allow-listed. Go to /admin/login to sign in.");
    }catch(err){ setMsg(String(err.message||err)); }
    finally{ setBusy(false); }
  };

  return (
    <main style={{padding:24,maxWidth:520,margin:"0 auto",fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>Dev Admin Signup</h1>
      <form onSubmit={submit} style={{display:"grid",gap:8}}>
        <input type="email" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        <button disabled={busy} type="submit">{busy?"Working…":"Create Admin"}</button>
      </form>
      {msg && <p style={{marginTop:12,color:"#c084fc"}}>{msg}</p>}
      <p style={{marginTop:12}}><a href="/admin/login">Go to Admin Login</a></p>
    </main>
  );
}
