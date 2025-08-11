import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [msg,setMsg]=useState("");
  const [busy,setBusy]=useState(false);
  const [otpBusy,setOtpBusy]=useState(false);

  const signIn = async (e)=>{
    e.preventDefault(); setMsg(""); setBusy(true);
    try{
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      window.location.href="/admin/dashboard";
    }catch(err){ setMsg(String(err.message||err)); }
    finally{ setBusy(false); }
  };

  const sendMagic = async ()=>{
    setMsg(""); setOtpBusy(true);
    try{
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + "/admin/dashboard" }
      });
      if (error) throw new Error(error.message);
      setMsg("Magic link sent! Check your email.");
    }catch(err){ setMsg(String(err.message||err)); }
    finally{ setOtpBusy(false); }
  };

  return (
    <main style={{padding:24,maxWidth:520,margin:"0 auto",fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>Admin Login</h1>
      <div style={{fontSize:12,opacity:.6,marginBottom:8}}>
  project: {process.env.NEXT_PUBLIC_SUPABASE_URL}
</div>
      <form onSubmit={signIn} style={{display:"grid",gap:8}}>
        <input type="email" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button disabled={busy} type="submit">{busy ? "Working…" : "Sign in"}</button>
      </form>

      <div style={{marginTop:12,display:"flex",gap:8,alignItems:"center"}}>
        <input style={{flex:1}} type="email" placeholder="email for magic link" value={email} onChange={e=>setEmail(e.target.value)} />
        <button disabled={otpBusy || !email} onClick={sendMagic}>
          {otpBusy ? "Sending…" : "Send magic link"}
        </button>
      </div>

      {msg && <p style={{marginTop:12,color:"#6b7280"}}>{msg}</p>}
    </main>
  );
}
