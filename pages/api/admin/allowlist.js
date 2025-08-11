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
