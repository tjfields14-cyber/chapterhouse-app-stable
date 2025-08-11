# Chapterhouse (stable)

Deploy on Vercel. Set envs:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
Optional: SITE_URL

Routes:
- / → redirects to /admin/login
- /admin/dev-signup → create admin + allowlist
- /admin/login → password or magic link
- /admin/dashboard → shows session + logout
- /widget → sandbox widget

Supabase → Auth → URL Configuration:
- Site URL = your vercel domain
- Add to Redirect URLs
