export interface FundHolding {
  id: string;
  user_id: string;
  scheme_name: string;
  category: string;
  amc: string;
  units: number;
  nav: number;
  invested_value: number;
  current_value: number;
  absolute_returns: number;
  xirr: number;
  recommendation: 'CONTINUE' | 'PAUSE' | 'STOP' | 'REVIEW';
  fund_score: number;
}
