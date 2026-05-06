import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client - bypasses RLS, use only in server-side API routes
// Falls back to anon key if service role not configured
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set - using anon key (RLS applies)')
  }
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
