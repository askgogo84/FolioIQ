import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { uid, email, name, photo } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const admin = createAdminClient()

    // Check if user exists in Supabase, create if not
    const { data: existing } = await admin.auth.admin.listUsers() as any
    const found = (existing?.users ?? []).find((u: any) => u.email === email)

    let userId: string

    if (found) {
      userId = found.id
    } else {
      // Create user in Supabase
      const { data: newUser, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, photo, firebase_uid: uid, provider: 'google' }
      })
      if (error) throw error
      userId = newUser.user.id
    }

    // Generate a session token so Supabase middleware works
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: 'https://folio-iq.vercel.app/dashboard' }
    })

    const hashedToken = linkData?.properties?.hashed_token
    const sessionUrl = hashedToken
      ? `https://folio-iq.vercel.app/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/dashboard`
      : null

    return NextResponse.json({ success: true, userId, sessionUrl })
  } catch (err) {
    console.error('Firebase sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
