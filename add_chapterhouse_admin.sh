set -euo pipefail
mkdir -p pages/admin pages/api/admin lib

# Browser client (uses NEXT_PUBLIC_* vars)
cat > lib/supabase.js <<'EOG'
import { createClient } from "@supabase/supabase-js";
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(url, anon, { auth: { persistSession: false } });
EOG

# Server client (uses SERVICE ROLE — server only)
cat > lib/supabaseAdmin.js <<'EOG'
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });
EOG

# Dev signup page
cat > pages/admin/dev-signup.js <<'EOG'
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
EOG

# Login page
cat > pages/admin/login.js <<'EOG'
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
EOG

# Dashboard
cat > pages/admin/dashboard.js <<'EOG'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard(){
  const [user,setUser]=useState(null);
  useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data?.user||null)); },[]);
  return (
    <main style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>Dashboard</h1>
      <p>{user ? `Signed in as ${user.email}` : "Not signed in."}</p>
    </main>
  );
}
EOG

# API route uses service role to upsert admins
cat > pages/api/admin/allowlist.js <<'EOG'
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({ error:"Method not allowed" });
  const { email, username } = req.body||{};
  if(!email) return res.status(400).json({ error:"email required" });
  const { error } = await supabaseAdmin.from("admins").upsert(
    { email, username: username||email.split("@")[0], is_active: true },
    { onConflict: "email" }
  );
  if(error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ ok:true });
}
EOG

echo "✅ Admin routes added."
