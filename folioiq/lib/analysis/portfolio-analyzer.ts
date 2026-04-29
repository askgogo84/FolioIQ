// lib/analysis/portfolio-analyzer.ts
import type { FundHolding } from "@/types/portfolio";
import { fetchFundDetails, fetchNAVHistory } from "@/lib/mfapi/fund-data";

export async function analyzePortfolio(
  holdings: Partial<FundHolding>[]
): Promise<Partial<FundHolding>[]> {
  const analyzed: Partial<FundHolding>[] = [];

  for (const holding of holdings) {
    if (!holding.scheme_name) continue;

    // Fetch fund details from MFAPI/AMFI
    const fundDetails = await fetchFundDetails(holding.scheme_name, holding.isin || "");

    if (!fundDetails) {
      // Fallback with basic info
      analyzed.push({
        ...holding,
        category: "Unknown",
        amc: "Unknown",
        recommendation: "REVIEW",
        recommendation_reason: ["Could not fetch fund details. Please verify ISIN."],
        fund_score: 50,
      });
      continue;
    }

    // Calculate metrics
    const nav = holding.nav || fundDetails.nav || 0;
    const units = holding.units || 0;
    const currentValue = holding.current_value || nav * units;
    const investedValue = holding.invested_value || currentValue * 0.9; // Estimate if not available

    const absoluteReturns = investedValue > 0 
      ? ((currentValue - investedValue) / investedValue) * 100 
      : 0;

    // Estimate XIRR (simplified - would use actual cash flows)
    const xirr = estimateXIRR(investedValue, currentValue, holding.purchase_date || new Date().toISOString());

    // Tax calculation
    const purchaseDate = new Date(holding.purchase_date || Date.now());
    const now = new Date();
    const daysHeld = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

    const isEquity = fundDetails.category?.includes("Equity") || false;
    const gainType = daysHeld < (isEquity ? 365 : 1095) ? "STCG" : "LTCG";

    const gain = currentValue - investedValue;
    let stcgTax = 0;
    let ltcgTax = 0;

    if (gain > 0) {
      if (gainType === "STCG") {
        stcgTax = gain * (isEquity ? 0.15 : 0.30); // 15% for equity, slab for debt
      } else {
        const taxableLTCG = Math.max(0, gain - 100000); // 1L exemption
        ltcgTax = taxableLTCG * (isEquity ? 0.10 : 0.20); // 10% equity, 20% with indexation for debt
      }
    }

    const postTaxValue = currentValue - stcgTax - ltcgTax;
    const postTaxReturns = investedValue > 0 ? ((postTaxValue - investedValue) / investedValue) * 100 : 0;

    // Score and recommend
    const { score, recommendation, reasons } = calculateFundScore({
      fundDetails,
      xirr,
      expenseRatio: fundDetails.expense_ratio || 1.5,
      categoryAverageExpense: 1.2,
      absoluteReturns,
      daysHeld,
      isEquity,
    });

    analyzed.push({
      ...holding,
      scheme_code: fundDetails.scheme_code,
      category: fundDetails.category,
      amc: fundDetails.amc,
      nav,
      nav_date: new Date().toISOString(),
      invested_value: investedValue,
      current_value: currentValue,
      absolute_returns: absoluteReturns,
      xirr,
      purchase_date: holding.purchase_date || new Date().toISOString(),
      days_held: daysHeld,
      gain_type: gainType,
      stcg_tax: stcgTax,
      ltcg_tax: ltcgTax,
      post_tax_value: postTaxValue,
      post_tax_returns: postTaxReturns,
      expense_ratio: fundDetails.expense_ratio || 1.5,
      category_average_expense: 1.2,
      fund_score: score,
      recommendation,
      recommendation_reason: reasons,
      alpha: fundDetails.alpha || 0,
      beta: fundDetails.beta || 1,
      sharpe_ratio: fundDetails.sharpe_ratio || 1,
      max_drawdown: fundDetails.max_drawdown || 0,
    });
  }

  return analyzed;
}

function estimateXIRR(invested: number, current: number, purchaseDate: string): number {
  const days = Math.floor((Date.now() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24));
  const years = days / 365;
  if (years <= 0 || invested <= 0) return 0;

  // Simplified CAGR as XIRR proxy
  return (Math.pow(current / invested, 1 / years) - 1) * 100;
}

interface ScoreInput {
  fundDetails: any;
  xirr: number;
  expenseRatio: number;
  categoryAverageExpense: number;
  absoluteReturns: number;
  daysHeld: number;
  isEquity: boolean;
}

function calculateFundScore(input: ScoreInput): { 
  score: number; 
  recommendation: "CONTINUE" | "PAUSE" | "STOP" | "REVIEW"; 
  reasons: string[] 
} {
  const { fundDetails, xirr, expenseRatio, categoryAverageExpense, absoluteReturns, daysHeld, isEquity } = input;

  let score = 50; // Base score
  const reasons: string[] = [];

  // Returns vs category (25%)
  if (fundDetails.returns_3y !== undefined) {
    if (fundDetails.returns_3y > 15) {
      score += 15;
      reasons.push("Strong 3-year returns vs category peers");
    } else if (fundDetails.returns_3y > 10) {
      score += 8;
    } else if (fundDetails.returns_3y < 5) {
      score -= 15;
      reasons.push("Underperforming category average by >5%");
    }
  }

  // Expense ratio (15%)
  if (expenseRatio < categoryAverageExpense * 0.8) {
    score += 10;
    reasons.push("Low expense ratio vs peers — more money stays invested");
  } else if (expenseRatio > categoryAverageExpense * 1.3) {
    score -= 10;
    reasons.push("High expense ratio eating into returns");
  }

  // Risk-adjusted returns (20%)
  if (fundDetails.sharpe_ratio !== undefined) {
    if (fundDetails.sharpe_ratio > 1.5) {
      score += 12;
      reasons.push("Excellent risk-adjusted returns (Sharpe > 1.5)");
    } else if (fundDetails.sharpe_ratio < 0.5) {
      score -= 8;
      reasons.push("Poor risk-adjusted returns — too volatile for the gains");
    }
  }

  // Fund manager stability (15%)
  if (fundDetails.fund_manager_tenure !== undefined) {
    if (fundDetails.fund_manager_tenure > 5) {
      score += 8;
      reasons.push("Experienced fund manager with >5 year tenure");
    } else if (fundDetails.fund_manager_tenure < 2) {
      score -= 5;
      reasons.push("New fund manager — watch for style changes");
    }
  }

  // Tax efficiency (15%)
  if (daysHeld > (isEquity ? 365 : 1095)) {
    score += 5;
    reasons.push("Holding period qualifies for LTCG — tax efficient");
  } else {
    reasons.push("Still in STCG zone — consider holding longer for tax savings");
  }

  // AUM trend (10%)
  if (fundDetails.aum !== undefined) {
    if (fundDetails.aum > 1000) { // 1000 crores
      score += 5;
    } else if (fundDetails.aum < 100) {
      score -= 5;
      reasons.push("Very small AUM — risk of fund closure or liquidity issues");
    }
  }

  score = Math.max(0, Math.min(100, score));

  // Determine recommendation
  let recommendation: "CONTINUE" | "PAUSE" | "STOP" | "REVIEW";

  if (score >= 70) {
    recommendation = "CONTINUE";
    if (reasons.length === 0) reasons.push("Strong performer across all metrics");
  } else if (score >= 50) {
    recommendation = "PAUSE";
    if (reasons.length === 0) reasons.push("Mixed signals — monitor closely before adding more");
  } else if (score >= 30) {
    recommendation = "REVIEW";
    if (reasons.length === 0) reasons.push("Multiple red flags — detailed review recommended");
  } else {
    recommendation = "STOP";
    if (reasons.length === 0) reasons.push("Significant underperformance — consider exit");
  }

  return { score, recommendation, reasons };
}
