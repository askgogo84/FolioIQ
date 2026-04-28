import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function hasSupabaseEnv() {
  return Boolean(url && (adminKey || publicKey))
}

export function createServerSupabaseClient() {
  const key = adminKey || publicKey

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

export function createBrowserSupabaseClient() {
  if (!url || !publicKey) {
    throw new Error("Missing public Supabase environment variables")
  }

  return createClient(url, publicKey)
}
