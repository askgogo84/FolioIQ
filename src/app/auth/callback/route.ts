import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type OtpType = 'magiclink' | 'signup' | 'invite' | 'recovery' | 'email' | 'email_change';

// After successful auth: send to /onboarding if user has zero holdings, else /dashboard.
async function resolveDestination(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '/auth';

    const { count } = await supabase
      .from('portfolio_holdings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return (count || 0) > 0 ? '/dashboard' : '/onboarding';
  } catch (e) {
    console.error('Destination resolve error:', e);
    return '/dashboard';
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const token_hash = url.searchParams.get('token_hash');
  const type = (url.searchParams.get('type') as OtpType) || 'magiclink';
  const explicitNext = url.searchParams.get('next');

  const supabase = await createClient();

  // Handle token_hash (custom OTP flow)
  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) console.error('token_hash verify error:', error.message);

    const dest = explicitNext || (await resolveDestination());
    console.log('token_hash auth → redirecting to:', dest);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Handle OAuth/PKCE code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const dest = explicitNext || (await resolveDestination());
      return NextResponse.redirect(new URL(dest, request.url));
    }
    console.error('exchangeCode error:', error.message);
  }

  // No valid token
  return NextResponse.redirect(new URL('/auth', request.url));
}
