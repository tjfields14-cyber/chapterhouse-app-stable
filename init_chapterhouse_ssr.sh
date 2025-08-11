set -euo pipefail

mkdir -p pages/admin pages/api/admin lib supabase/migrations public

# .gitignore
cat > .gitignore <<'EOG'
node_modules
.next
.env*
*.log
EOG

# package.json (SSR build)
cat > package.json <<'EOG'
{
  "name": "chapterhouse-app",
  "version": "3.2.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "echo \"(optional)\""
  },
  "dependencies": {
    "@supabase/supabase-js": "2.45.4",
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
EOG

# Next.js SSR config
cat > next.config.js <<'EOG'
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true
};
EOG

# Netlify (SSR runtime)
cat > netlify.toml <<'EOG'
[build]
  command = "npm run build"
  publish = ".next"
[[plugins]]
  package = "@netlify/plugin-nextjs"
EOG

# Path alias
cat > jsconfig.json <<'EOG'
{
  "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["*"] } }
}
EOG

# Env example
cat > .env.example <<'EOG'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EOG

# Supabase browser client
cat > lib/supabase.js <<'EOG'
// lib/supabase.js
import { createClient } from "@supabase/supabase-js";
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(url, anon, { auth: { persistSession: false } });
EOG

# Supabase service (server-only)
cat > lib/supabaseAdmin.js <<'EOG'
// lib/supabaseAdmin.js (server-only)
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });
EOG

# App wrapper
cat > pages/_app.js <<'EOG'
export default function App({ Component, pageProps }) { return <Component {...pageProps} />; }
EOG

# Home
cat > pages/index.js <<'EOG'
export default function Home(){
  return (
    <main style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>Chapterhouse (SSR)</h1>
      <ul>
        <li><a href="/admin/dev-signup">Dev Admin Signup</a></li>
        <li><a href="/admin/login">Admin Login</a></li>
        <li><a href="/admin/dashboard">Dashboard</a></li>
      </ul>
      <p style={{opacity:.7}}>Deploy as SSR on Netlify (.next via @netlify/plugin-nextjs)</p>
    </main>
  );
}
EOG

# Dev signup (creates auth user + allowlists via API)
cat > pages/admin/dev-signup.js <<'EOG'
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DevSignup(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);

  const submit=async(e)=>{
    e.preventDefault(); setMsg(""); setBusy(true);
    try{
      const { error: authErr } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/admin/login" }
      });
      if(authErr) throw new Error(authErr.message);

      const r = await fetch("/api/admin/allowlist",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email })
      });
      const j = await r.json();
      if(!r.ok) throw new Error(j.error||"Allowlist failed");

      setMsg("Admin created & allow-listed. Go to /admin/login to sign in.");
    }catch(err){ setMsg(String(err.message||err)); }
    finally{ setBusy(false); }
  };

  return (
    <main style={{padding:24,fontFamily:"ui-sans-serif,system-ui",maxWidth:520,margin:"0 auto"}}>
      <h1>Dev Admin Signup (temporary)</h1>
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

# Admin login
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
    <main style={{padding:24,fontFamily:"ui-sans-serif,system-ui",maxWidth:520,margin:"0 auto"}}>
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

# Dashboard (basic check)
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

# API route: allowlist admin (service role)
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

# Minimal migration (admins table)
cat > supabase/migrations/001_full_reset.sql <<'EOG'
-- Minimal bootstrap for Chapterhouse admin
create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text,
  is_active boolean default true,
  created_at timestamptz default now()
);
EOG

# README with deploy steps
cat > README-DEPLOY.md <<'EOG'
# Chapterhouse — SSR Deploy (Netlify)

## Netlify env (Site settings → Environment variables)
- NEXT_PUBLIC_SUPABASE_URL = https://<project>.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon public>
- SUPABASE_SERVICE_ROLE_KEY = <service role>  (server-only, used by /api routes)

## Build
- Build command: `npm run build`
- Publish directory: `.next`
- Netlify reads `netlify.toml` and runs the Next.js runtime.

## Supabase
- Settings → API → Data API: ON, Exposed schemas = public
- SQL Editor: run `supabase/migrations/001_full_reset.sql`

## Flow
1) Deploy → /admin/dev-signup → create admin (also allowlists)
2) /admin/login → sign in
3) /admin/dashboard → confirm
EOG

echo "✅ Chapterhouse SSR scaffold written."
