import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

const RESEND_KEY = 're_hZkMXHtg_6BZvmYRJZAtdWEpr6eFe8U9S'
const OTP_EXPIRY = 10

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
      const { data: stored } = await admin
        .from('otp_codes')
        .select('otp, expires_at, used')
        .eq('email', email)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!stored) return NextResponse.json({ error: 'No OTP found. Request a new one.' }, { status: 400 })
      if (new Date(stored.expires_at) < new Date()) return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 })
      if (stored.otp !== submittedOtp) return NextResponse.json({ error: 'Incorrect code. Check your email.' }, { status: 400 })

      await admin.from('otp_codes').update({ used: true }).eq('email', email).eq('otp', submittedOtp)

      // Generate session link
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: 'https://folio-iq.vercel.app/dashboard' }
      })
      if (linkErr) {
        console.error('generateLink error:', linkErr.message)
        return NextResponse.json({ success: true, verified: true })
      }

      const hashedToken = linkData.properties.hashed_token
      const callbackUrl = hashedToken
        ? `https://folio-iq.vercel.app/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/dashboard`
        : linkData.properties.action_link

      return NextResponse.json({ success: true, verified: true, link: callbackUrl })
    }

    // ── SEND MODE ────────────────────────────────────────────
    // Generate OTP + magic link using admin (works for ANY email, no Supabase email limits)
    const otp = genOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 60000).toISOString()

    // Store OTP
    const { error: storeErr } = await admin.from('otp_codes').insert({ email, otp, expires_at: expiresAt })
    if (storeErr) console.error('Store error:', storeErr.message)

    // Generate a magic link for the email (admin API, no rate limits, any email)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: 'https://folio-iq.vercel.app/dashboard' }
    })

    if (linkErr) {
      console.error('generateLink error:', linkErr.message)
      return NextResponse.json({ error: 'Could not generate login link. Try again.' }, { status: 500 })
    }

    const magicLink = linkData.properties.action_link

    // Send email via Resend — branded OTP email with BOTH the code AND a fallback magic link
    const emailHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif;">
<div style="max-width:480px;margin:40px auto;padding:20px;">
  <div style="background:white;border-radius:20px;padding:40px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="width:64px;height:64px;background:linear-gradient(135deg,#10b981,#059669);border-radius:16px;margin:0 auto 24px;line-height:64px;font-size:32px;">📊</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111827;">Your FolioIQ Login Code</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Enter this 6-digit code to sign in to FolioIQ</p>
    <div style="background:#f0fdf4;border:2px solid #10b981;border-radius:16px;padding:28px;margin-bottom:28px;">
      <div style="font-size:56px;font-weight:900;letter-spacing:16px;color:#065f46;font-family:monospace;">${otp}</div>
    </div>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Or click the button below to sign in directly</p>
    <a href="${magicLink}" style="display:inline-block;background:#111827;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">Sign in to FolioIQ →</a>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.8;">⏱ Expires in ${OTP_EXPIRY} minutes · 🔒 Never share this code</p>
  </div>
</div></body></html>`

    let emailSent = false

    // Try Resend
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'FolioIQ <onboarding@resend.dev>',
          to: [email],
          subject: `${otp} — your FolioIQ login code`,
          html: emailHtml
        })
      })
      if (res.ok) {
        emailSent = true
        console.log('OTP email sent via Resend to:', email)
      } else {
        const err = await res.json()
        console.log('Resend rejected:', err.message || err.statusCode, '— using admin email fallback')
      }
    } catch (e) {
      console.log('Resend error:', e)
    }

    // Fallback: Use Supabase admin to invite/send email directly
    if (!emailSent) {
      try {
        // Use admin.auth.admin.inviteUserByEmail as an email sending mechanism
        // This sends an email via Supabase's SMTP to ANY email
        // We put the OTP in the redirect URL data so the email contains useful info
        const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo: `https://folio-iq.vercel.app/auth/callback?next=/dashboard`,
          data: { otp_hint: otp }
        })
        
        if (!inviteErr) {
          emailSent = true
          console.log('Invite email sent via Supabase admin to:', email)
          // For this path, user gets an invite link — mark our OTP as used since they'll use the invite
          // But also return the magic link so auth page can redirect directly
          return NextResponse.json({ 
            success: true, 
            method: 'invite',
            // Return the token-hash callback URL so user can also just enter OTP
            message: 'Check your email — click the sign-in link OR enter the code if shown'
          })
        } else {
          console.error('Admin invite error:', inviteErr.message)
        }
      } catch (e) {
        console.error('Admin invite exception:', e)
      }
    }

    // Last resort: Return the magic link directly — user can click it in the response  
    if (!emailSent) {
      console.log('All email methods failed — returning magic link for', email)
      // Return the callback URL directly — auth page will redirect user there
      const hashedToken = linkData.properties.hashed_token
      const callbackUrl = hashedToken
        ? `https://folio-iq.vercel.app/auth/callback?token_hash=${hashedToken}&type=magiclink&next=/dashboard`
        : magicLink
      
      return NextResponse.json({ 
        success: true, 
        method: 'direct_link',
        link: callbackUrl,
        message: 'Email delivery unavailable — using direct sign-in link'
      })
    }

    return NextResponse.json({ success: true, method: 'resend' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('OTP route error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
