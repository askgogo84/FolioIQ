import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/utils/supabase/admin'

const RESEND_KEY = 're_hZkMXHtg_6BZvmYRJZAtdWEpr6eFe8U9S'
const OTP_EXPIRY = 10
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp: submittedOtp } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // ── VERIFY MODE ──────────────────────────────────────────
    if (submittedOtp) {
      const admin = createAdminClient()
      
      // First check our custom OTP table (for Resend-sent codes)
      const { data: stored } = await admin
        .from('otp_codes')
        .select('otp, expires_at, used')
        .eq('email', email)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (stored) {
        if (new Date(stored.expires_at) < new Date()) {
          return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 })
        }
        if (stored.otp !== submittedOtp) {
          return NextResponse.json({ error: 'Incorrect code. Check your email.' }, { status: 400 })
        }
        await admin.from('otp_codes').update({ used: true }).eq('email', email).eq('otp', submittedOtp)

        // Create session via magic link
        const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: { redirectTo: 'https://folio-iq.vercel.app/dashboard' }
        })
        if (linkErr) return NextResponse.json({ success: true, verified: true })

        const hashedToken = linkData.properties.hashed_token
        const callbackUrl = hashedToken
          ? `https://folio-iq.vercel.app/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/dashboard`
          : linkData.properties.action_link

        return NextResponse.json({ success: true, verified: true, link: callbackUrl })
      }

      // No custom OTP found → try Supabase native verify
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON)
      const { error } = await sb.auth.verifyOtp({ email, token: submittedOtp, type: 'email' })
      if (!error) {
        return NextResponse.json({ success: true, verified: true, useSupabaseSession: true })
      }
      return NextResponse.json({ error: 'Incorrect or expired code. Try again.' }, { status: 400 })
    }

    // ── SEND MODE ────────────────────────────────────────────
    // Try Resend first (verified emails only — goverdhan.md@gmail.com)
    const otp = genOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 60000).toISOString()

    // Attempt Resend
    let resendOk = false
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'FolioIQ <onboarding@resend.dev>',
          to: [email],
          subject: `${otp} is your FolioIQ login code`,
          html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif;">
<div style="max-width:480px;margin:40px auto;padding:20px;">
  <div style="background:white;border-radius:20px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="width:64px;height:64px;background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;margin:0 auto 24px;line-height:64px;font-size:32px;">📊</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111827;">Your FolioIQ Login Code</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Enter this 6-digit code to sign in</p>
    <div style="background:#f0fdf4;border:2px solid #10b981;border-radius:16px;padding:28px;margin-bottom:28px;">
      <div style="font-size:56px;font-weight:900;letter-spacing:16px;color:#065f46;font-family:monospace;">${otp}</div>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:13px;line-height:2;">⏱ Expires in ${OTP_EXPIRY} minutes<br>🔒 Never share this code<br>📊 FolioIQ — India's AI Portfolio Analyzer</p>
  </div>
</div></body></html>`
        })
      })
      if (emailRes.ok) {
        resendOk = true
        // Store in our table for verify
        await createAdminClient().from('otp_codes').insert({ email, otp, expires_at: expiresAt })
        console.log('OTP sent via Resend to:', email)
      } else {
        const err = await emailRes.json()
        console.log('Resend rejected (non-verified email):', err.message || err.statusCode)
      }
    } catch (e) {
      console.log('Resend network error:', e)
    }

    if (resendOk) {
      return NextResponse.json({ success: true, method: 'resend' })
    }

    // Fallback: Supabase native signInWithOtp — works for ANY email
    // The Supabase email template sends {{ .Token }} = 6-digit code
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON)
    const { error: sbErr } = await sb.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // NO emailRedirectTo → Supabase sends 6-digit code (not magic link)
      }
    })

    if (sbErr) {
      console.error('Supabase OTP also failed:', sbErr.message)
      return NextResponse.json({ 
        error: 'Unable to send OTP. Please try again in a minute.', 
        detail: sbErr.message 
      }, { status: 500 })
    }

    console.log('OTP sent via Supabase native to:', email)
    return NextResponse.json({ success: true, method: 'supabase' })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('OTP route error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
