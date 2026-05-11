import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

const RESEND_KEY = 're_hZkMXHtg_6BZvmYRJZAtdWEpr6eFe8U9S'
const OTP_EXPIRY_MINUTES = 10

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp: submittedOtp } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const adminSupabase = createAdminClient()

    // VERIFY mode - check submitted OTP
    if (submittedOtp) {
      const { data: stored } = await adminSupabase
        .from('otp_codes')
        .select('otp, expires_at, used')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!stored) return NextResponse.json({ error: 'No OTP found. Request a new one.' }, { status: 400 })
      if (stored.used) return NextResponse.json({ error: 'OTP already used. Request a new one.' }, { status: 400 })
      if (new Date(stored.expires_at) < new Date()) return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 })
      if (stored.otp !== submittedOtp) return NextResponse.json({ error: 'Invalid OTP. Try again.' }, { status: 400 })

      // Mark as used
      await adminSupabase.from('otp_codes').update({ used: true }).eq('email', email).eq('otp', submittedOtp)

      // Sign in or create user via Supabase admin
      const { data: existingUser } = await adminSupabase.auth.admin.listUsers()
      const user = existingUser.users.find((u: any) => u.email === email)
      
      let userId: string
      if (user) {
        userId = user.id
      } else {
        const { data: newUser, error: createErr } = await adminSupabase.auth.admin.createUser({
          email, email_confirm: true
        })
        if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 })
        userId = newUser.user.id
      }

      // Find or create user
      const { data: { users }, error: listErr } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 })
      let targetUser = users?.find((u: any) => u.email === email)
      
      if (!targetUser) {
        const { data: newUser, error: createErr } = await adminSupabase.auth.admin.createUser({
          email, email_confirm: true, user_metadata: { email_verified: true }
        })
        if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 })
        targetUser = newUser.user
      } else {
        // Confirm email if not confirmed
        await adminSupabase.auth.admin.updateUserById(targetUser.id, { email_confirm: true })
      }

      // Generate a sign-in link that sets session properly
      const { data: linkData, error: linkErr } = await adminSupabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: 'https://folio-iq.vercel.app/auth/callback?next=/dashboard' }
      })
      if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 400 })

      return NextResponse.json({ success: true, link: linkData.properties.action_link })
    }

    // SEND mode - generate and email OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

    // Store OTP in Supabase
    await adminSupabase.from('otp_codes').insert({ email, otp, expires_at: expiresAt, used: false })

    // Send via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FolioIQ <onboarding@resend.dev>',
        to: [email],
        subject: `Your FolioIQ login code: ${otp}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #f9fafb;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center;">
              <div style="width: 56px; height: 56px; background: #10b981; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px;">📊</div>
              <h1 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px;">Your FolioIQ Login Code</h1>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 32px;">Enter this code to sign in to your account</p>
              <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #065f46; font-family: monospace;">${otp}</div>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.<br>Never share this code with anyone.</p>
            </div>
          </div>
        `
      })
    })

    const emailData = await emailRes.json()
    if (!emailRes.ok) {
      console.error('Resend error:', emailData)
      return NextResponse.json({ error: 'Failed to send email: ' + (emailData.message || 'Unknown error') }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('OTP error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
