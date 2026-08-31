export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return Boolean(url && key && String(url).startsWith('http'))
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  return {
    url: String(import.meta.env.VITE_SUPABASE_URL ?? ''),
    anonKey: String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''),
  }
}
