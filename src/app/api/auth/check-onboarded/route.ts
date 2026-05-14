import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Returns { onboarded: boolean }
// onboarded = true if user has at least one row in portfolio_holdings
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ onboarded: false, authenticated: false }, { status: 401 });

    const { count, error } = await supabase
      .from('portfolio_holdings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Onboarded check error:', error);
      // Fail open — treat as onboarded so we don't trap returning users in onboarding
      return NextResponse.json({ onboarded: true, authenticated: true });
    }

    return NextResponse.json({
      onboarded: (count || 0) > 0,
      authenticated: true,
      holdingsCount: count || 0,
    });
  } catch (e: unknown) {
    return NextResponse.json({ onboarded: true, authenticated: true });
  }
}
