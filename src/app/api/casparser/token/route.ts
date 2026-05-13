import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const key = process.env.CAS_PARSER_API_KEY || 'sk_3b3bb349a0038d3af978f16af4db52da'

    const res = await fetch('https://api.casparser.in/v1/token', {
      method: 'POST',
      headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiry_minutes: 30 }),
    })

    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      return NextResponse.json({ error: e.detail || 'Token generation failed' }, { status: res.status })
    }

    const d = await res.json()
    return NextResponse.json({ access_token: d.access_token })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
