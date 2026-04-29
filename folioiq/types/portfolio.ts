// types/portfolio.ts

export interface FundHolding {
  id: string;
  user_id: string;
  isin: string;
  scheme_code: string;
  scheme_name: string;
  category: string;        // Equity Large Cap, Debt, Hybrid, etc.
  amc: string;             // HDFC, SBI, ICICI, etc.
  units: number;
  nav: number;             // Current NAV
  nav_date: string;        // Date of NAV
  invested_value: number;
  current_value: number;
  absolute_returns: number; // Percentage
  xirr: number;            // Annualized returns

  // Tax-related
  purchase_date: string;
  days_held: number;
  gain_type: 'STCG' | 'LTCG' | 'NONE';
  stcg_tax: number;
  ltcg_tax: number;
  post_tax_value: number;
  post_tax_returns: number;

  // Analysis
  expense_ratio: number;
  category_average_expense: number;
  fund_score: number;       // 0-100
  recommendation: 'CONTINUE' | 'PAUSE' | 'STOP' | 'REVIEW';
  recommendation_reason: string[];

  // Risk metrics
  alpha: number;
  beta: number;
  sharpe_ratio: number;
  max_drawdown: number;

  created_at: string;
  updated_at: string;
}

export interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  total_absolute_returns: number;
  total_xirr: number;
  total_stcg_tax: number;
  total_ltcg_tax: number;
  total_tax_liability: number;
  post_tax_value: number;
  post_tax_xirr: number;

  // Breakdown
  equity_allocation: number;  // Percentage
  debt_allocation: number;
  hybrid_allocation: number;
  other_allocation: number;

  // Fund counts
  total_funds: number;
  continue_count: number;
  pause_count: number;
  stop_count: number;
  review_count: number;

  // Daily change
  day_change_value: number;
  day_change_percent: number;
}

export interface FundCategory {
  name: string;
  allocation: number;
  value: number;
  returns: number;
  color: string;
}

export interface UploadResult {
  success: boolean;
  holdings: Partial<FundHolding>[];
  errors: string[];
  message: string;
}

export interface DailyNAV {
  date: string;
  nav: number;
}

export interface FundAnalysis {
  scheme_code: string;
  scheme_name: string;
  category: string;
  returns_1y: number;
  returns_3y: number;
  returns_5y: number;
  category_rank_1y: number;
  category_rank_3y: number;
  category_rank_5y: number;
  category_total_funds: number;
  expense_ratio: number;
  aum: number;
  fund_manager: string;
  fund_manager_tenure: number;
  risk_rating: 'Low' | 'Moderately Low' | 'Moderate' | 'Moderately High' | 'High';
}
