import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

const RESEND_KEY = 're_hZkMXHtg_6BZvmYRJZAtdWEpr6eFe8U9S'
const OTP_EXPIRY = 10

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp: submittedOtp } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // VERIFY mode
    if (submittedOtp) {
      const supabase = await createClient()
      const { data: stored, error: fetchErr } = await supabase
        .from('otp_codes')
        .select('otp, expires_at, used')
        .eq('email', email)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fetchErr) {
        console.error('OTP fetch error:', fetchErr.message)
        return NextResponse.json({ error: 'Verification error. Try again.' }, { status: 400 })
      }
      if (!stored) return NextResponse.json({ error: 'No OTP found. Request a new one.' }, { status: 400 })
      if (new Date(stored.expires_at) < new Date()) return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 })
      if (stored.otp !== submittedOtp) return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 })

      // Mark as used
      await supabase.from('otp_codes').update({ used: true })
        .eq('email', email).eq('otp', submittedOtp)

      // Use admin to generate magic link that sets proper session cookie
      const admin = createAdminClient()
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: 'https://folio-iq.vercel.app/auth/callback?next=/dashboard' }
      })

      if (linkErr) {
        console.error('generateLink error:', linkErr.message)
        // Fallback: return verified:true and let client handle
        return NextResponse.json({ success: true, verified: true })
      }

      console.log('OTP verified, session link generated for:', email)
      return NextResponse.json({ 
        success: true, 
        verified: true, 
        link: linkData.properties.action_link 
      })
    }

    // SEND mode
    const otp = genOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 60000).toISOString()

    const supabase = await createClient()
    const { error: storeErr } = await supabase
      .from('otp_codes')
      .insert({ email, otp, expires_at: expiresAt })

    if (storeErr) console.error('OTP store error:', storeErr.message)

    // Send beautiful email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FolioIQ <onboarding@resend.dev>',
        to: [email],
        subject: `${otp} is your FolioIQ login code`,
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif;">
<div style="max-width:480px;margin:40px auto;padding:20px;">
  <div style="background:white;border-radius:20px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="width:64px;height:64px;background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;margin:0 auto 24px;line-height:64px;font-size:32px;">📊</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111827;">Your Login Code</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Enter this 6-digit code to sign in to FolioIQ</p>
    <div style="background:#f0fdf4;border:2px solid #10b981;border-radius:16px;padding:28px;margin-bottom:28px;">
      <div style="font-size:56px;font-weight:900;letter-spacing:16px;color:#065f46;font-family:monospace;">${otp}</div>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:13px;line-height:2;">⏱ Expires in ${OTP_EXPIRY} minutes<br>🔒 Never share this code<br>📊 FolioIQ — India's AI Portfolio Analyzer</p>
  </div>
</div></body></html>`
      })
    })

    if (!emailRes.ok) {
      const err = await emailRes.json()
      console.error('Resend error:', JSON.stringify(err))
      return NextResponse.json({ error: 'Email failed: ' + (err.message || 'Unknown') }, { status: 500 })
    }

    console.log('OTP sent to:', email)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('OTP route error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
