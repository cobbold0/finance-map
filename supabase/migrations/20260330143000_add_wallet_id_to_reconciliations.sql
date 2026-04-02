ALTER TABLE public.reconciliations
ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reconciliations_wallet_id
ON public.reconciliations(wallet_id);
