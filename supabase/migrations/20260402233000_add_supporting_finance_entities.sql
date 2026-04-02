CREATE TABLE IF NOT EXISTS public.bank_account_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch TEXT,
  swift_code TEXT,
  mobile_money_provider TEXT,
  mobile_money_number TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  quote_currency TEXT NOT NULL,
  rate DECIMAL(20, 8) NOT NULL,
  source TEXT DEFAULT 'manual',
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.bank_account_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bank account details" ON public.bank_account_details;
DROP POLICY IF EXISTS "Users can insert their own bank account details" ON public.bank_account_details;
DROP POLICY IF EXISTS "Users can update their own bank account details" ON public.bank_account_details;
DROP POLICY IF EXISTS "Users can delete their own bank account details" ON public.bank_account_details;
CREATE POLICY "Users can view their own bank account details"
ON public.bank_account_details
FOR SELECT
USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bank account details"
ON public.bank_account_details
FOR INSERT
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank account details"
ON public.bank_account_details
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank account details"
ON public.bank_account_details
FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view exchange rates" ON public.exchange_rates;
CREATE POLICY "Users can view exchange rates"
ON public.exchange_rates
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bank_account_details_user_id
ON public.bank_account_details(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_quote
ON public.exchange_rates(base_currency, quote_currency);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
ON public.audit_logs(user_id);

CREATE OR REPLACE FUNCTION public.increment_wallet_balance(wallet_id_input UUID, amount_input DECIMAL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wallets
  SET
    balance = COALESCE(balance, 0) + amount_input,
    updated_at = NOW()
  WHERE id = wallet_id_input
    AND user_id = auth.uid();
END;
$$;
