-- Fix ownership gaps in RLS policies and allow profile bootstrap inserts.

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.wallets
    WHERE wallets.id = transactions.wallet_id
      AND wallets.user_id = auth.uid()
  )
  AND (
    destination_wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets AS destination_wallet
      WHERE destination_wallet.id = transactions.destination_wallet_id
        AND destination_wallet.user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can update their own transactions"
ON public.transactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.wallets
    WHERE wallets.id = transactions.wallet_id
      AND wallets.user_id = auth.uid()
  )
  AND (
    destination_wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets AS destination_wallet
      WHERE destination_wallet.id = transactions.destination_wallet_id
        AND destination_wallet.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can insert budget_items for their budgets" ON public.budget_items;
DROP POLICY IF EXISTS "Users can update their budget_items" ON public.budget_items;
CREATE POLICY "Users can insert budget_items for their budgets"
ON public.budget_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.budgets
    WHERE budgets.id = budget_items.budget_id
      AND budgets.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM public.budget_categories
    WHERE budget_categories.id = budget_items.category_id
      AND budget_categories.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their budget_items"
ON public.budget_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.budgets
    WHERE budgets.id = budget_items.budget_id
      AND budgets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.budgets
    WHERE budgets.id = budget_items.budget_id
      AND budgets.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM public.budget_categories
    WHERE budget_categories.id = budget_items.category_id
      AND budget_categories.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
CREATE POLICY "Users can insert their own goals"
ON public.goals
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    linked_wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets
      WHERE wallets.id = goals.linked_wallet_id
        AND wallets.user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can update their own goals"
ON public.goals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    linked_wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets
      WHERE wallets.id = goals.linked_wallet_id
        AND wallets.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.recurring_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.recurring_templates;
CREATE POLICY "Users can insert their own templates"
ON public.recurring_templates
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets
      WHERE wallets.id = recurring_templates.wallet_id
        AND wallets.user_id = auth.uid()
    )
  )
  AND (
    destination_wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets AS destination_wallet
      WHERE destination_wallet.id = recurring_templates.destination_wallet_id
        AND destination_wallet.user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can update their own templates"
ON public.recurring_templates
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets
      WHERE wallets.id = recurring_templates.wallet_id
        AND wallets.user_id = auth.uid()
    )
  )
  AND (
    destination_wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets AS destination_wallet
      WHERE destination_wallet.id = recurring_templates.destination_wallet_id
        AND destination_wallet.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can insert their own reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Users can update their own reconciliations" ON public.reconciliations;
CREATE POLICY "Users can insert their own reconciliations"
ON public.reconciliations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets
      WHERE wallets.id = reconciliations.wallet_id
        AND wallets.user_id = auth.uid()
    )
  )
  AND (
    adjustment_transaction_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.transactions
      WHERE transactions.id = reconciliations.adjustment_transaction_id
        AND transactions.user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can update their own reconciliations"
ON public.reconciliations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    wallet_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.wallets
      WHERE wallets.id = reconciliations.wallet_id
        AND wallets.user_id = auth.uid()
    )
  )
  AND (
    adjustment_transaction_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.transactions
      WHERE transactions.id = reconciliations.adjustment_transaction_id
        AND transactions.user_id = auth.uid()
    )
  )
);
