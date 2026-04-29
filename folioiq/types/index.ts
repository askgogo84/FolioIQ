export interface FundHolding {
  id: string;
  user_id: string;
  scheme_code: string;
  scheme_name: string;
  isin: string;
  units: number;
  purchase_nav: number;
  current_nav: number;
  current_value: number;
  invested_value: number;
  absolute_return: number;
  xirr: number;
  category: string;
  fund_house: string;
  plan_type: 'Direct' | 'Regular';
  option: 'Growth' | 'IDCW' | 'Dividend';
  folio_number?: string;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  total_absolute_return: number;
  total_xirr: number;
  total_unrealized_gain: number;
  tax_liability: {
    stcg: number;
    ltcg: number;
    effective_tax: number;
    post_tax_value: number;
  };
  category_breakdown: CategoryAllocation[];
  fund_house_breakdown: FundHouseAllocation[];
  top_performers: FundHolding[];
  under_performers: FundHolding[];
  recommendations: FundRecommendation[];
  daily_change: {
    amount: number;
    percentage: number;
  };
}

export interface CategoryAllocation {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface FundHouseAllocation {
  fund_house: string;
  value: number;
  percentage: number;
}

export interface FundRecommendation {
  fund_id: string;
  scheme_name: string;
  action: 'CONTINUE' | 'PAUSE' | 'STOP' | 'INCREASE';
  confidence: number; // 0-100
  reason: string;
  details: string[];
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  tax_implication?: string;
}

export interface NAVData {
  date: string;
  nav: number;
}

export interface FundDetails {
  scheme_code: string;
  scheme_name: string;
  fund_house: string;
  category: string;
  scheme_type: string;
  latest_nav: number;
  nav_date: string;
  expense_ratio?: number;
  aum?: number;
  riskometer?: string;
  benchmark?: string;
  fund_manager?: string;
  exit_load?: string;
  min_investment?: number;
  sip_min?: number;
  historical_nav: NAVData[];
  returns: {
    '1y': number;
    '3y': number;
    '5y': number;
    inception: number;
  };
}

export interface ParsedCAS {
  holdings: Partial<FundHolding>[];
  statement_date: string;
  period_from: string;
  period_to: string;
  total_value: number;
  transactions?: CASTransaction[];
}

export interface CASTransaction {
  date: string;
  type: 'PURCHASE' | 'REDEMPTION' | 'SWITCH' | 'DIVIDEND' | 'SIP';
  scheme_name: string;
  amount: number;
  units: number;
  nav: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  description: string;
}
