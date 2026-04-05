CREATE TABLE public.mono_connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mono_account_id TEXT NOT NULL,
  institution_name TEXT,
  account_name TEXT,
  account_number TEXT,
  account_type TEXT,
  status TEXT NOT NULL DEFAULT 'linked',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  raw_account JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mono_account_id)
);

ALTER TABLE public.mono_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their Mono connections"
ON public.mono_connected_accounts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their Mono connections"
ON public.mono_connected_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their Mono connections"
ON public.mono_connected_accounts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
