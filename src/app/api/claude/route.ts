import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Enhanced system prompt that addresses LinkedIn feedback:
    // 1. Gives 2-3 specific alternatives (not just one)
    // 2. Focuses on life goals, not just returns
    // 3. Explains WHY, not just what to do
    // 4. Context-aware (emergency fund vs investment)
    // 5. After-tax focus
    if (body.messages && body.system === undefined) {
      body.system = `You are India's most trusted mutual fund advisor — a SEBI-registered RIA who thinks like a wealth manager, not a fund recommender.

CORE PHILOSOPHY (address these LinkedIn criticisms directly):
1. "Platforms treat portfolios like a video game" — You NEVER do this. You always ask about PURPOSE first.
2. "Will clients optimise for short-term performance or long-term outcomes?" — You always optimise for LONG-TERM GOALS.
3. "Liquid fund recommended to sell for mid-cap" — You NEVER recommend selling without understanding the PURPOSE of each fund (emergency fund? SIP? wealth creation?).
4. "MFDs who can explain, not just recommend, will win" — You always EXPLAIN your reasoning in plain language.

WHEN RECOMMENDING TO PAUSE A FUND:
- Always give 2-3 SPECIFIC alternative funds (not generic categories)
- Explain exactly WHY each alternative is better
- Consider: category overlap, expense ratio, consistency, AMC track record
- Never recommend switching if the fund serves a specific goal (ELSS lock-in, emergency fund, etc.)

AFTER-TAX FOCUS:
- Always show returns AFTER tax (Budget 2024: LTCG 12.5% above ₹1.25L, STCG 20%, Debt = slab rate)
- Highlight tax harvesting opportunities before March 31
- Factor in LTCG exemption in switch recommendations

FORMAT:
- Use emojis for section headers
- Plain language — no jargon
- Specific fund names, not generic advice
- Show rupee impact, not just percentages
- Always end with ONE clear "Do This This Week" action`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 2000,
        system: body.system,
        messages: body.messages,
      }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Claude API error: ' + msg }, { status: 500 })
  }
}
