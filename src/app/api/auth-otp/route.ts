import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const RESEND_KEY = 're_hZkMXHtg_6BZvmYRJZAtdWEpr6eFe8U9S'
const OTP_EXPIRY = 10 // minutes

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp: submittedOtp } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const supabase = await createClient()

    // VERIFY mode
    if (submittedOtp) {
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
        return NextResponse.json({ error: 'Verification failed. Try again.' }, { status: 400 })
      }
      if (!stored) return NextResponse.json({ error: 'No OTP found. Request a new one.' }, { status: 400 })
      if (new Date(stored.expires_at) < new Date()) return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 })
      if (stored.otp !== submittedOtp) return NextResponse.json({ error: 'Incorrect code. Check your email.' }, { status: 400 })

      // Mark used
      await supabase.from('otp_codes').update({ used: true })
        .eq('email', email).eq('otp', submittedOtp)

      return NextResponse.json({ success: true, verified: true })
    }

    // SEND mode - generate OTP and email it
    const otp = genOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 60000).toISOString()

    // Store (upsert by email to avoid duplicates)
    const { error: storeErr } = await supabase
      .from('otp_codes')
      .insert({ email, otp, expires_at: expiresAt })

    if (storeErr) {
      console.error('OTP store error:', storeErr.message)
      // If table doesn't exist or RLS blocks, still try to send email
    }

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
        subject: `${otp} is your FolioIQ login code`,
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif;">
<div style="max-width:480px;margin:40px auto;padding:20px;">
  <div style="background:white;border-radius:20px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="width:64px;height:64px;background:#10b981;border-radius:16px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;font-size:32px;">📊</div>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">Your Login Code</h1>
    <p style="margin:0 0 32px;color:#6b7280;font-size:15px;">Enter this code in FolioIQ to sign in</p>
    <div style="background:#f0fdf4;border:2px solid #10b981;border-radius:16px;padding:28px;margin-bottom:28px;">
      <div style="font-size:52px;font-weight:900;letter-spacing:14px;color:#065f46;font-family:monospace;">${otp}</div>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
      ⏱ Expires in ${OTP_EXPIRY} minutes<br>
      🔒 Never share this code with anyone<br>
      📱 FolioIQ — AI Portfolio Intelligence
    </p>
  </div>
</div>
</body>
</html>`
      })
    })

    const emailData = await emailRes.json()
    if (!emailRes.ok) {
      console.error('Resend error:', JSON.stringify(emailData))
      return NextResponse.json({ error: 'Email failed: ' + (emailData.message || 'Unknown') }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'OTP sent to ' + email })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('OTP route error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
