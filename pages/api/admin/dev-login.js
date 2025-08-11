// pages/api/admin/dev-login.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { token, email } = req.query || {};
    if (!token || token !== process.env.DEV_ADMIN_TOKEN) {
      return res.status(403).json({ error: "forbidden" });
    }
    if (!email) return res.status(400).json({ error: "email required" });

    // Ensure user exists & is confirmed
    await supabaseAdmin.auth.admin.createUser({ email, email_confirm: true }).catch(()=>{});

    // Allowlist in admins table
    await supabaseAdmin.from("admins").upsert(
      { email, username: email.split("@")[0], is_active: true },
      { onConflict: "email" }
    );

    // Generate magic link and redirect (auto-signs in)
    const host = process.env.SITE_URL || `https://${req.headers.host}`;
    const redirectTo = host + "/admin/dashboard";

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo }
    });
    if (error) return res.status(400).json({ error: error.message });

    const link = data?.properties?.action_link || data?.action_link || data?.email_otp_link;
    if (!link) return res.status(500).json({ error: "No magic link returned" });

    res.writeHead(302, { Location: link });
    res.end();
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
