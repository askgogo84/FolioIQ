# FolioIQ 🧠

> **Smarter than INDmoney.** AI-powered mutual fund analysis for Indian investors.

Upload your CAS statement. Get instant, actionable insights: which funds to **continue**, **pause**, or **stop**. See **real post-tax returns**, not misleading headline numbers.

![Dashboard Preview](https://via.placeholder.com/800x400/0f172a/3b82f6?text=FolioIQ+Dashboard)

## ✨ What Makes It Smarter

| Feature | INDmoney | **FolioIQ** |
|---------|----------|-------------|
| Recommendations | Generic | **AI-scored with clear reasons** |
| Tax Analysis | Basic LTCG/STCG | **Tax-loss harvesting + FY projections** |
| Returns | Headline XIRR | **Post-tax actual returns** |
| Fund Scoring | None | **Multi-factor 0-100 score** |
| Alerts | NAV changes | **Fund manager changes, style drift, expense hikes** |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/askgogo84/FolioIQ.git
cd FolioIQ
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
# Fill in your Clerk and Supabase keys
```

### 3. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase-schema.sql` in the SQL Editor
3. Enable Row Level Security (RLS) policies

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Dashboard Features

### For Every Investor (Layman-Friendly)
- **One-click upload**: PDF/Excel CAS from CAMS/Karvy
- **Color-coded signals**: 🟢 Continue 🟡 Pause 🔴 Stop 🔵 Review
- **Plain English explanations**: No jargon, just clear reasons

### For Pros
- **Rolling returns analysis**: 1Y, 3Y, 5Y vs category
- **Risk metrics**: Sharpe, Sortino, Max Drawdown, Beta
- **Tax simulation**: What if I sell today? Next FY?
- **Rebalancing suggestions**: Goal-based allocation

## 🏗 Architecture

```
FolioIQ/
├── app/                    # Next.js App Router
│   ├── api/upload/        # CAS parsing endpoint
│   ├── dashboard/         # Main dashboard (Server Component)
│   ├── upload/            # Portfolio upload page
│   └── page.tsx           # Landing page
├── components/
│   ├── dashboard/         # Dashboard widgets
│   │   ├── summary-cards.tsx
│   │   ├── holdings-table.tsx
│   │   ├── portfolio-chart.tsx
│   │   ├── recommendation-panel.tsx
│   │   └── tax-impact-card.tsx
│   └── upload-hero.tsx    # Landing upload zone
├── lib/
│   ├── parsers/           # CAS PDF/Excel parsers
│   ├── analysis/          # Scoring & tax engine
│   ├── mfapi/            # AMFI/MFAPI data fetcher
│   └── supabase/         # Database clients
├── types/                 # TypeScript definitions
└── supabase-schema.sql    # Database setup
```

## 🧠 AI Scoring Algorithm

Funds are scored 0-100 based on:

| Factor | Weight | Data Source |
|--------|--------|-------------|
| Returns vs Category | 25% | AMFI 3Y/5Y rankings |
| Expense Ratio | 15% | AMFI expense ratio feed |
| Risk-Adjusted Returns | 20% | Sharpe ratio |
| Fund Manager Tenure | 15% | AMFI disclosures |
| Tax Efficiency | 15% | Holding period analysis |
| AUM Trend | 10% | AMFI monthly AUM |

**Recommendations:**
- **≥70**: Continue SIPs
- **50-69**: Pause new investments
- **30-49**: Detailed review needed
- **<30**: Consider exit

## 🔒 Security

- **AES-256 encryption** at rest
- **Clerk authentication** with MFA support
- **Row Level Security** in Supabase
- **No bank details** ever read or stored
- **Indian servers only** (Supabase Mumbai region)

## 📱 Roadmap

- [ ] WhatsApp alerts for fund changes
- [ ] Goal-based SIP calculator
- [ ] Tax-loss harvesting automation
- [ ] Broker API integrations (Zerodha, Groww)
- [ ] PPF/EPF/NPS portfolio tracking
- [ ] AI chatbot for fund queries

## 🤝 Contributing

This is an open-source project. PRs welcome!

## 📄 License

MIT License - see LICENSE file

---

Built with ❤️ for Indian investors who deserve better than misleading headline returns.
