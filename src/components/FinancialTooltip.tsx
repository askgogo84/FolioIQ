"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

interface FinancialTooltipProps {
  term: string;
  explanation: string;
  simpleExplanation: string;
}

const termDatabase: Record<string, { explanation: string; simple: string }> = {
  "XIRR": {
    explanation: "Extended Internal Rate of Return - measures the annualized return of your investments considering irregular cash flows.",
    simple: "Think of this as your 'real return rate' - it tells you how fast your money is growing per year, factoring in all your SIPs and lump sum investments at different times."
  },
  "Sharpe Ratio": {
    explanation: "Measures risk-adjusted returns. Higher = better returns per unit of risk taken.",
    simple: "This tells you if a fund is giving you good returns WITHOUT taking crazy risks. Above 1 is good, above 2 is excellent."
  },
  "Alpha": {
    explanation: "Excess return compared to the benchmark index. Positive = fund beat the market.",
    simple: "This shows how much EXTRA the fund manager earned ABOVE the market average. Positive = they are skilled, Negative = you would have been better off with a simple index fund."
  },
  "Beta": {
    explanation: "Measures volatility relative to the market. 1 = moves with market, >1 = more volatile, <1 = less volatile.",
    simple: "This measures how 'jumpy' the fund is compared to the overall market. 1 = same as market, 1.5 = 50% more volatile, 0.5 = half as volatile."
  },
  "Expense Ratio": {
    explanation: "Annual fee charged by the fund house as a percentage of your investment.",
    simple: "This is the yearly fee you pay the fund company. Lower is better! Even 0.5% difference can cost you lakhs over 20 years."
  },
  "AUM": {
    explanation: "Assets Under Management - total money managed by the fund.",
    simple: "How much total money is invested in this fund. Very large funds can be hard to manage, very small ones might shut down."
  },
  "NAV": {
    explanation: "Net Asset Value - price per unit of the mutual fund.",
    simple: "The price of ONE unit of the fund, similar to a stock price. It goes up and down based on the fund's performance."
  },
  "SIP": {
    explanation: "Systematic Investment Plan - investing a fixed amount regularly (usually monthly).",
    simple: "Investing a fixed amount every month automatically. This helps you buy more units when prices are low and fewer when high - it's called 'rupee cost averaging'."
  },
  "ELSS": {
    explanation: "Equity Linked Savings Scheme - tax-saving mutual fund with 3-year lock-in.",
    simple: "A special mutual fund that helps you save income tax (up to ₹1.5L under Section 80C). But your money is locked for 3 years."
  },
  "STCG": {
    explanation: "Short Term Capital Gains - profit from selling equity funds held less than 1 year. Taxed at 15%.",
    simple: "Profit from selling a fund within 1 year. Tax rate: 15% flat."
  },
  "LTCG": {
    explanation: "Long Term Capital Gains - profit from selling equity funds held more than 1 year. First ₹1.25L is tax-free, rest taxed at 10%.",
    simple: "Profit from selling a fund after 1 year. First ₹1.25 lakh profit is TAX-FREE! Only profits above that are taxed at 10%."
  },
  "Tax Loss Harvesting": {
    explanation: "Selling loss-making investments to offset capital gains and reduce tax liability.",
    simple: "Sell your losing funds to reduce the tax on your winning funds. It's completely legal and smart tax planning!"
  },
  "Flexi Cap": {
    explanation: "Fund that can invest across large, mid, and small cap companies without restrictions.",
    simple: "A fund that can invest in ANY size company - big (Reliance), medium, or small. The manager has full freedom."
  },
  "Small Cap": {
    explanation: "Funds investing in smaller companies (ranked 251+ by market cap). High growth potential but high risk.",
    simple: "Invests in smaller, growing companies. Can give huge returns but also crash hard. Don't put more than 8-10% of your money here."
  },
  "Large Cap": {
    explanation: "Funds investing in top 100 companies by market cap. Stable, lower risk.",
    simple: "Invests in India's biggest, most stable companies (like Reliance, TCS). Lower risk, steady returns - good for beginners."
  },
  "Debt Fund": {
    explanation: "Invests in bonds and fixed-income instruments. Lower risk, stable returns.",
    simple: "Invests in government and company bonds instead of stocks. Much safer than equity, gives 6-8% returns like FDs but with better tax treatment."
  },
  "Arbitrage Fund": {
    explanation: "Exploits price differences between cash and futures markets. Low risk, equity taxation benefits.",
    simple: "Makes money from tiny price differences in the stock market. Very low risk, but also lower returns (6-8%). Great for short-term parking."
  },
  "Sectoral Fund": {
    explanation: "Invests in a specific sector (e.g., Technology, Infrastructure). High concentration risk.",
    simple: "Bets on ONE industry only (like only IT companies or only infrastructure). Very risky - if that sector crashes, your fund crashes."
  },
  "Health Score": {
    explanation: "AI-calculated score (0-100) based on returns, risk, consistency, and fund quality.",
    simple: "Our AI gives each fund a score out of 100. Above 80 = excellent, 60-80 = okay, below 60 = consider selling."
  },
  "Rebalancing": {
    explanation: "Adjusting portfolio allocation to maintain target percentages.",
    simple: "Moving money between funds to keep your portfolio balanced. Like adjusting ingredients in a recipe to get the perfect taste."
  },
};

export default function FinancialTooltip({ term, explanation, simpleExplanation }: FinancialTooltipProps) {
  const [show, setShow] = useState(false);
  const dbEntry = termDatabase[term];

  return (
    <span className="relative inline-flex items-center gap-1">
      <span className="font-medium">{term}</span>
      <button
        onClick={() => setShow(!show)}
        className="w-4 h-4 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
      >
        <HelpCircle className="w-3 h-3 text-blue-600" />
      </button>
      
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 text-sm">{term}</h4>
            <button onClick={() => setShow(false)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100">
              <X className="w-3 h-3 text-slate-500" />
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            {dbEntry?.explanation || explanation}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1">💡 In Simple Terms:</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              {dbEntry?.simple || simpleExplanation}
            </p>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
        </div>
      )}
    </span>
  );
}
