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
