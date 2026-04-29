-- Supabase Schema for FolioIQ
-- Run this in Supabase SQL Editor

-- Enable RLS
alter table if exists holdings enable row level security;

-- Holdings table
CREATE TABLE IF NOT EXISTS holdings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    isin TEXT,
    scheme_code TEXT,
    scheme_name TEXT NOT NULL,
    category TEXT,
    amc TEXT,
    units DECIMAL(15,6) DEFAULT 0,
    nav DECIMAL(12,4) DEFAULT 0,
    nav_date DATE,
    invested_value DECIMAL(15,2) DEFAULT 0,
    current_value DECIMAL(15,2) DEFAULT 0,
    absolute_returns DECIMAL(8,2) DEFAULT 0,
    xirr DECIMAL(8,2) DEFAULT 0,

    -- Tax fields
    purchase_date DATE,
    days_held INTEGER DEFAULT 0,
    gain_type TEXT CHECK (gain_type IN ('STCG', 'LTCG', 'NONE')),
    stcg_tax DECIMAL(15,2) DEFAULT 0,
    ltcg_tax DECIMAL(15,2) DEFAULT 0,
    post_tax_value DECIMAL(15,2) DEFAULT 0,
    post_tax_returns DECIMAL(8,2) DEFAULT 0,

    -- Analysis fields
    expense_ratio DECIMAL(5,2) DEFAULT 0,
    category_average_expense DECIMAL(5,2) DEFAULT 0,
    fund_score INTEGER DEFAULT 50 CHECK (fund_score >= 0 AND fund_score <= 100),
    recommendation TEXT CHECK (recommendation IN ('CONTINUE', 'PAUSE', 'STOP', 'REVIEW')),
    recommendation_reason TEXT[], -- Array of strings

    -- Risk metrics
    alpha DECIMAL(8,2) DEFAULT 0,
    beta DECIMAL(5,2) DEFAULT 1,
    sharpe_ratio DECIMAL(5,2) DEFAULT 1,
    max_drawdown DECIMAL(8,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_recommendation ON holdings(recommendation);
CREATE INDEX IF NOT EXISTS idx_holdings_category ON holdings(category);

-- RLS Policy: Users can only see their own holdings
CREATE POLICY "Users can only access their own holdings"
    ON holdings
    FOR ALL
    USING (auth.uid()::text = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_holdings_updated_at ON holdings;
CREATE TRIGGER update_holdings_updated_at
    BEFORE UPDATE ON holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Daily NAV tracking table (for historical data)
CREATE TABLE IF NOT EXISTS nav_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scheme_code TEXT NOT NULL,
    nav DECIMAL(12,4) NOT NULL,
    nav_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scheme_code, nav_date)
);

CREATE INDEX IF NOT EXISTS idx_nav_history_scheme ON nav_history(scheme_code);
CREATE INDEX IF NOT EXISTS idx_nav_history_date ON nav_history(nav_date);
