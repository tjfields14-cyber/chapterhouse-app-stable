import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const defaultUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const defaultAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
};

export const supabase: SupabaseClient = createClient(defaultUrl, defaultAnon, options);

export function getClient(u?: string, a?: string): SupabaseClient {
  const url  = (u && u.trim()) || defaultUrl;
  const anon = (a && a.trim()) || defaultAnon;
  return createClient(url, anon, options);
}

export default supabase;
