ALTER TABLE public.transactions
ADD COLUMN category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
