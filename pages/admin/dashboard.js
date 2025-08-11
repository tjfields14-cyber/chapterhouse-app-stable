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
