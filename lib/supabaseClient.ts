import { createClient, SupabaseClient } from '@supabase/supabase-js'
let singleton: SupabaseClient | null = null
export function getClient(url?: string, anon?: string) {
  const supabaseUrl = (url || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const supabaseAnonKey = (anon || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  if (!singleton) singleton = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, storageKey: 'chapterhouse_widget' } })
  return singleton
}
