export interface Database {
  public: {
    Tables: {
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          updated_at?: string;
        };
      };
      holdings: {
        Row: {
          id: string;
          portfolio_id: string;
          scheme_code: string;
          scheme_name: string;
          isin: string;
          units: number;
          purchase_nav: number;
          current_nav: number | null;
          current_value: number | null;
          invested_value: number;
          absolute_return: number | null;
          xirr: number | null;
          category: string;
          fund_house: string;
          plan_type: string;
          option: string;
          folio_number: string | null;
          purchase_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          scheme_code: string;
          scheme_name: string;
          isin: string;
          units: number;
          purchase_nav: number;
          current_nav?: number | null;
          current_value?: number | null;
          invested_value: number;
          absolute_return?: number | null;
          xirr?: number | null;
          category: string;
          fund_house: string;
          plan_type: string;
          option: string;
          folio_number?: string | null;
          purchase_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          current_nav?: number | null;
          current_value?: number | null;
          absolute_return?: number | null;
          xirr?: number | null;
          updated_at?: string;
        };
      };
      fund_cache: {
        Row: {
          scheme_code: string;
          scheme_name: string;
          fund_house: string;
          category: string;
          latest_nav: number;
          nav_date: string;
          expense_ratio: number | null;
          aum: number | null;
          returns_1y: number | null;
          returns_3y: number | null;
          returns_5y: number | null;
          cached_at: string;
        };
        Insert: {
          scheme_code: string;
          scheme_name: string;
          fund_house: string;
          category: string;
          latest_nav: number;
          nav_date: string;
          expense_ratio?: number | null;
          aum?: number | null;
          returns_1y?: number | null;
          returns_3y?: number | null;
          returns_5y?: number | null;
          cached_at?: string;
        };
        Update: {
          latest_nav?: number;
          nav_date?: string;
          expense_ratio?: number | null;
          aum?: number | null;
          returns_1y?: number | null;
          returns_3y?: number | null;
          returns_5y?: number | null;
          cached_at?: string;
        };
      };
    };
  };
}
