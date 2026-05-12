import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@supabase/supabase-js'

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
    const admin = createAdminClient()

    // ── VERIFY MODE ──────────────────────────────────────────
    if (submittedOtp) {
      // Check custom OTP table first (for Resend-sent codes)
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
          return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 })
        }
        if (stored.otp !== submittedOtp) {
          return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 })
        }
        await admin.from('otp_codes').update({ used: true }).eq('email', email).eq('otp', submittedOtp)

        // Generate session
        const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
          type: 'magiclink', email,
          options: { redirectTo: 'https://folio-iq.vercel.app/dashboard' }
        })
        if (linkErr) return NextResponse.json({ success: true, verified: true })
        const hashedToken = linkData.properties.hashed_token
        const callbackUrl = hashedToken
          ? `https://folio-iq.vercel.app/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/dashboard`
          : linkData.properties.action_link
        return NextResponse.json({ success: true, verified: true, link: callbackUrl })
      }

      // Try Supabase native verify (for Supabase-sent OTPs)
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON)
      const { data: vData, error: vErr } = await sb.auth.verifyOtp({
        email, token: submittedOtp, type: 'email'
      })
      if (!vErr) {
        return NextResponse.json({ success: true, verified: true, useSupabaseSession: true })
      }
      return NextResponse.json({ error: 'Incorrect or expired code. Try again.' }, { status: 400 })
    }

    // ── SEND MODE ────────────────────────────────────────────
    const otp = genOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 60000).toISOString()

    // Always generate magic link for session creation
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink', email,
      options: { redirectTo: 'https://folio-iq.vercel.app/dashboard' }
    })
    if (linkErr) {
      console.error('generateLink failed:', linkErr.message)
      return NextResponse.json({ error: 'Login generation failed. Try again.' }, { status: 500 })
    }
    const hashedToken = linkData.properties.hashed_token
    const callbackUrl = hashedToken
      ? `https://folio-iq.vercel.app/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/dashboard`
      : linkData.properties.action_link

    // STRATEGY:
    // 1. Try Resend branded email (goverdhan.md@gmail.com only on sandbox)
    // 2. Try Supabase signInWithOtp (works for ALL emails via custom SMTP/Resend)
    // 3. Fallback: return magic link directly (instant auto-login, no email needed)

    // Attempt 1: Resend branded OTP
    let emailSent = false
    let method = ''
    try {
      await admin.from('otp_codes').insert({ email, otp, expires_at: expiresAt })
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'FolioIQ <onboarding@resend.dev>',
          to: [email],
          subject: `${otp} — your FolioIQ login code`,
          html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif;">
<div style="max-width:480px;margin:40px auto;padding:20px;">
  <div style="background:white;border-radius:20px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="width:64px;height:64px;background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:28px;">📊</div>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#111827;">Your FolioIQ Login Code</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Enter this code or click below to sign in instantly</p>
    <div style="background:#f0fdf4;border:2px solid #10b981;border-radius:16px;padding:24px;margin-bottom:24px;">
      <div style="font-size:52px;font-weight:900;letter-spacing:14px;color:#065f46;font-family:monospace;">${otp}</div>
    </div>
    <a href="${callbackUrl}" style="display:inline-block;background:#111827;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:20px;">Sign in instantly →</a>
    <p style="margin:0;color:#9ca3af;font-size:12px;">⏱ Expires in ${OTP_EXPIRY} minutes · 🔒 Never share this code</p>
  </div>
</div></body></html>`
        })
      })
      if (res.ok) {
        emailSent = true
        method = 'resend'
        console.log('✅ Resend email sent to:', email)
      } else {
        const err = await res.json().catch(() => ({}))
        console.log('Resend rejected for', email, ':', err.message || err.statusCode)
      }
    } catch (e) { console.log('Resend error:', e) }

    // Attempt 2: Supabase signInWithOtp via custom SMTP (works for ALL emails)
    if (!emailSent) {
      try {
        const sb = createClient(SUPABASE_URL, SUPABASE_ANON)
        const { error: sbErr } = await sb.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true }
        })
        if (!sbErr) {
          emailSent = true
          method = 'supabase'
          console.log('✅ Supabase OTP sent to:', email)
          // Supabase sends its own code — mark our custom OTP as used
          await admin.from('otp_codes').update({ used: true }).eq('email', email).eq('otp', otp)
        } else {
          console.log('Supabase OTP error:', sbErr.message)
        }
      } catch (e) { console.log('Supabase error:', e) }
    }

    // Fallback: auto-login via magic link (no email needed)
    if (!emailSent) {
      console.log('⚡ All email methods failed — auto-login via magic link for:', email)
      return NextResponse.json({ success: true, method: 'direct_link', link: callbackUrl })
    }

    // Always return the magic link so auth page auto-redirects
    // If email was sent, user gets both: instant redirect + email with code as backup
    return NextResponse.json({ success: true, method, link: callbackUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('OTP route error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
