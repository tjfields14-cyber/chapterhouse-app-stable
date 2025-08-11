import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard(){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const u = (data && data.user) || null;
      setUser(u);
      setLoading(false);
      if (!u) window.location.href = "/admin/login";
    });
    return () => { mounted = false; };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif,system-ui" }}>
      <h1>Dashboard</h1>
      <p>Signed in as {user?.email}</p>
      <button onClick={signOut} style={{ marginTop: 12 }}>Log out</button>
    </main>
  );
}
