import { NextRequest, NextResponse } from 'next/server';

// Portfolio context — keeps Claude grounded in Aarav's actual portfolio.
const PORTFOLIO_CONTEXT = `
USER: Aarav Sharma · Plus member · KYC verified · Aggressive risk profile
PORTFOLIO SNAPSHOT (as of today):
- Invested: ₹35.20 L across 8 funds, 4 AMCs
- Current value: ₹48.47 L
- Unrealised gain: ₹13.27 L (+37.71%)
- XIRR: 18.4% (vs Nifty 11.4%)
- Dividend YTD: ₹3,600

HOLDINGS:
1. Parag Parikh Flexi Cap (Flexi Cap, PPFAS) — ₹14.44 L, +12.83%, XIRR 21.4%, alloc 29.8%
2. Mirae Asset Large Cap (Large Cap) — ₹32.48 L, +16.00%, XIRR 14.2%, alloc 26.7%
3. Axis Small Cap (Small Cap) — ₹43.58 L, +36.19%, XIRR 28.7%, alloc 24.1% — day −1.22%
4. ICICI Pru Nifty 50 Index (Index) — ₹32.49 L, +8.30%, XIRR 11.1%, alloc 13.9%
5. HDFC Mid-Cap Opportunities (Mid Cap) — ₹34.28 L, +42.85%, XIRR 24.8%, alloc 5.5%
6. SBI Bluechip (Large Cap) — ₹16.08 L, +33.97%, XIRR 16.4%, alloc 4.0%
7. Invesco India Gold ETF FoF — over target by 3%
8. ICICI Pru Technology — negative alpha, recommended exit

ASSET MIX: Equity 84.5% · Debt 9.2% · Gold/ETF 3.4% · International 1.9% · Cash 1.0%
TARGET ALLOCATION: Equity 70 · Debt 10 · Gold 10 · Hybrid 10
DRIFT: Slight (+4.1pp on equity, gold +3%, debt −6%)
SECTOR EXPOSURE: Financials 28.4% · IT 18.1% · Consumer · Energy · Auto 7.8%

TAX (FY 2025-26):
- STCG: ₹1,773 (tax: ₹265 @ 15%)
- STCL: ₹17,565 (can offset STCG)
- LTCG: ₹1,17,466 (₹1.25L exempt, rest @ 10%)
- Estimated tax liability: ₹6,231
- Harvestable: ₹1.04 L LTCG, ₹15,655 tax savings available
- LTCG exemption used: 83.2% of ₹1.25 L

ACTIVE SIPs: 8 plans, ₹45,500/month total
- Parag Parikh Flexi Cap: ₹15,000 (next: Jun 5)
- Mirae Asset Large Cap: ₹10,000 (next: Jun 7)
- Axis Small Cap: ₹8,000 (next: Jun 10)
`;

const SYSTEM_PROMPT = `You are Folio AI — a purpose-built portfolio assistant trained on Aarav Sharma's transactions, holdings, and the Indian mutual fund universe.

VOICE:
- Editorial, concise, confident. Speak like a wealth manager, not a chatbot.
- 2-3 sentence paragraphs. Use **bold** for fund names and rupee impacts.
- Always show after-tax view (Budget 2024: LTCG 12.5% above ₹1.25L, STCG 20% on equity).
- Lead with the answer, then the reasoning.
- For recommendations: give 2-3 specific alternatives with WHY each beats the alternative.

ALWAYS USE THE PORTFOLIO CONTEXT BELOW. Never give generic answers — every response should reference Aarav's actual funds, allocation, XIRR, or tax position.

${PORTFOLIO_CONTEXT}

When asked about market events, Indian fund flows, or recent moves, be specific (e.g. SEBI's small-cap disclosure norms, recent rate decisions).
Never recommend products you can't name. Never give SEBI-restricted advice (no buy/sell verdicts on direct equity).
End complex answers with ONE actionable next step.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ response: 'Please ask me something specific about your portfolio.' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { response: 'Folio AI is offline right now. The admin needs to set ANTHROPIC_API_KEY in Vercel env vars.' },
        { status: 200 }
      );
    }

    // Build message history for Claude API (filter + map)
    const priorMessages = Array.isArray(history)
      ? history
          .filter((m: { role: string; content: string }) => m && m.content && (m.role === 'user' || m.role === 'assistant'))
          .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
      : [];

    const messages = [...priorMessages, { role: 'user', content: message }];

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Anthropic API error:', apiRes.status, errText);
      return NextResponse.json({
        response: `Folio AI couldn't reach Claude (${apiRes.status}). Try again in a moment.`,
      });
    }

    const data = await apiRes.json();
    const text =
      data?.content?.find((b: { type: string; text?: string }) => b.type === 'text')?.text ??
      'I couldn\'t generate a response. Please try rephrasing.';

    return NextResponse.json({ response: text });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Chat route error:', msg);
    return NextResponse.json({
      response: 'Sorry, I ran into an error. Please try again.',
    });
  }
}
