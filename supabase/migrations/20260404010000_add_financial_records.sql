CREATE TABLE public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (
    record_type IN (
      'pension_tier_1',
      'pension_tier_2',
      'pension_tier_3',
      'investment',
      'insurance',
      'other'
    )
  ),
  label TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  product_name TEXT,
  reference_number TEXT,
  currency TEXT DEFAULT 'GHS',
  monthly_contribution DECIMAL(20, 2),
  current_value DECIMAL(20, 2),
  coverage_amount DECIMAL(20, 2),
  start_date DATE,
  maturity_date DATE,
  contact_person TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_financial_records_user_id
ON public.financial_records(user_id);

ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their financial records"
ON public.financial_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their financial records"
ON public.financial_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their financial records"
ON public.financial_records
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their financial records"
ON public.financial_records
FOR DELETE
USING (auth.uid() = user_id);
