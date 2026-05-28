-- Ensure portfolios table exists with correct structure
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_name TEXT DEFAULT 'My Portfolio',
  total_value NUMERIC DEFAULT 0,
  invested_amount NUMERIC DEFAULT 0,
  current_returns NUMERIC DEFAULT 0,
  xirr NUMERIC DEFAULT 0,
  fund_count INTEGER DEFAULT 0,
  funds JSONB DEFAULT '[]',
  monthly_sip NUMERIC DEFAULT 0,
  sip_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure fund_holdings table exists
CREATE TABLE IF NOT EXISTS public.fund_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  fund_name TEXT NOT NULL,
  amc TEXT,
  category TEXT,
  units NUMERIC DEFAULT 0,
  nav NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  invested_value NUMERIC DEFAULT 0,
  returns NUMERIC DEFAULT 0,
  xirr NUMERIC DEFAULT 0,
  folio_number TEXT,
  isin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_holdings ENABLE ROW LEVEL SECURITY;

-- Policies for portfolios (allow users to CRUD their own)
CREATE POLICY IF NOT EXISTS "Users can view own portfolios"
  ON public.portfolios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own portfolios"
  ON public.portfolios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own portfolios"
  ON public.portfolios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own portfolios"
  ON public.portfolios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for fund_holdings
CREATE POLICY IF NOT EXISTS "Users can view own fund holdings"
  ON public.fund_holdings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own fund holdings"
  ON public.fund_holdings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON public.portfolios(created_at);
CREATE INDEX IF NOT EXISTS idx_fund_holdings_user_id ON public.fund_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_holdings_portfolio_id ON public.fund_holdings(portfolio_id);
