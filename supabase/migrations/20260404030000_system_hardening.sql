ALTER TABLE public.profiles
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.profiles AS profiles
SET onboarding_completed = EXISTS (
  SELECT 1
  FROM public.settings AS settings
  WHERE settings.user_id = profiles.id
)
OR EXISTS (
  SELECT 1
  FROM public.wallets AS wallets
  WHERE wallets.user_id = profiles.id
);

ALTER TABLE public.settings
ADD COLUMN budget_warning_threshold INTEGER NOT NULL DEFAULT 80
CHECK (budget_warning_threshold BETWEEN 50 AND 95);

CREATE OR REPLACE FUNCTION public.create_budget_with_items(
  month_input TEXT,
  total_limit_input DECIMAL,
  items_input JSONB DEFAULT '[]'::JSONB
)
RETURNS TABLE (budget_id UUID, budget_month TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authed_user_id UUID := auth.uid();
BEGIN
  IF authed_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.budgets (user_id, month, total_limit)
  VALUES (authed_user_id, month_input, total_limit_input)
  RETURNING id, month INTO budget_id, budget_month;

  IF jsonb_typeof(COALESCE(items_input, '[]'::JSONB)) <> 'array' THEN
    RAISE EXCEPTION 'Budget items must be a JSON array';
  END IF;

  IF jsonb_array_length(COALESCE(items_input, '[]'::JSONB)) > 0 THEN
    IF EXISTS (
      SELECT 1
      FROM jsonb_to_recordset(items_input) AS item(category_id UUID, limit_amount DECIMAL)
      LEFT JOIN public.budget_categories AS categories
        ON categories.id = item.category_id
       AND categories.user_id = authed_user_id
      WHERE item.category_id IS NULL
         OR item.limit_amount IS NULL
         OR item.limit_amount < 0
         OR categories.id IS NULL
    ) THEN
      RAISE EXCEPTION 'Budget items must belong to the current user';
    END IF;

    INSERT INTO public.budget_items (budget_id, category_id, limit_amount)
    SELECT budget_id, item.category_id, item.limit_amount
    FROM jsonb_to_recordset(items_input) AS item(category_id UUID, limit_amount DECIMAL);
  END IF;

  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_transaction_with_wallet_impacts(
  transaction_id_input UUID,
  wallet_id_input UUID,
  destination_wallet_id_input UUID,
  transaction_type_input TEXT,
  amount_input DECIMAL,
  category_id_input UUID,
  description_input TEXT,
  occurred_at_input TIMESTAMP WITH TIME ZONE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authed_user_id UUID := auth.uid();
  persisted_transaction_id UUID;
  existing_transaction public.transactions%ROWTYPE;
  category_name_input TEXT;
  source_delta DECIMAL;
  existing_source_delta DECIMAL;
BEGIN
  IF authed_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF transaction_type_input NOT IN ('income', 'expense', 'transfer', 'salary', 'bonus', 'adjustment') THEN
    RAISE EXCEPTION 'Invalid transaction type';
  END IF;

  IF amount_input IS NULL OR amount_input <= 0 THEN
    RAISE EXCEPTION 'Transaction amount must be greater than zero';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.wallets
    WHERE id = wallet_id_input
      AND user_id = authed_user_id
  ) THEN
    RAISE EXCEPTION 'Source wallet does not belong to the current user';
  END IF;

  IF destination_wallet_id_input IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.wallets
    WHERE id = destination_wallet_id_input
      AND user_id = authed_user_id
  ) THEN
    RAISE EXCEPTION 'Destination wallet does not belong to the current user';
  END IF;

  IF destination_wallet_id_input IS NOT NULL AND destination_wallet_id_input = wallet_id_input THEN
    RAISE EXCEPTION 'Source and destination wallets must be different';
  END IF;

  IF category_id_input IS NOT NULL THEN
    SELECT name
    INTO category_name_input
    FROM public.budget_categories
    WHERE id = category_id_input
      AND user_id = authed_user_id;

    IF category_name_input IS NULL THEN
      RAISE EXCEPTION 'Budget category does not belong to the current user';
    END IF;
  END IF;

  IF transaction_id_input IS NOT NULL THEN
    SELECT *
    INTO existing_transaction
    FROM public.transactions
    WHERE id = transaction_id_input
      AND user_id = authed_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Transaction not found';
    END IF;

    existing_source_delta := CASE
      WHEN existing_transaction.type IN ('expense', 'transfer')
        THEN existing_transaction.amount * -1
      ELSE existing_transaction.amount
    END;

    UPDATE public.wallets
    SET balance = COALESCE(balance, 0) - existing_source_delta,
        updated_at = NOW()
    WHERE id = existing_transaction.wallet_id
      AND user_id = authed_user_id;

    IF existing_transaction.type = 'transfer'
      AND existing_transaction.destination_wallet_id IS NOT NULL THEN
      UPDATE public.wallets
      SET balance = COALESCE(balance, 0) - existing_transaction.amount,
          updated_at = NOW()
      WHERE id = existing_transaction.destination_wallet_id
        AND user_id = authed_user_id;
    END IF;

    UPDATE public.transactions
    SET wallet_id = wallet_id_input,
        destination_wallet_id = destination_wallet_id_input,
        type = transaction_type_input,
        amount = amount_input,
        category_id = category_id_input,
        category = category_name_input,
        description = NULLIF(BTRIM(description_input), ''),
        date = occurred_at_input,
        updated_at = NOW()
    WHERE id = transaction_id_input
      AND user_id = authed_user_id
    RETURNING id INTO persisted_transaction_id;
  ELSE
    INSERT INTO public.transactions (
      user_id,
      wallet_id,
      destination_wallet_id,
      type,
      amount,
      category_id,
      category,
      description,
      date
    )
    VALUES (
      authed_user_id,
      wallet_id_input,
      destination_wallet_id_input,
      transaction_type_input,
      amount_input,
      category_id_input,
      category_name_input,
      NULLIF(BTRIM(description_input), ''),
      occurred_at_input
    )
    RETURNING id INTO persisted_transaction_id;
  END IF;

  source_delta := CASE
    WHEN transaction_type_input IN ('expense', 'transfer')
      THEN amount_input * -1
    ELSE amount_input
  END;

  UPDATE public.wallets
  SET balance = COALESCE(balance, 0) + source_delta,
      updated_at = NOW()
  WHERE id = wallet_id_input
    AND user_id = authed_user_id;

  IF transaction_type_input = 'transfer'
    AND destination_wallet_id_input IS NOT NULL THEN
    UPDATE public.wallets
    SET balance = COALESCE(balance, 0) + amount_input,
        updated_at = NOW()
    WHERE id = destination_wallet_id_input
      AND user_id = authed_user_id;
  END IF;

  RETURN persisted_transaction_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_onboarding(
  full_name_input TEXT,
  base_currency_input TEXT,
  default_wallet_name_input TEXT,
  salary_date_input INTEGER,
  budget_warning_threshold_input INTEGER,
  browser_enabled_input BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authed_user_id UUID := auth.uid();
  authed_email TEXT;
BEGIN
  IF authed_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT email
  INTO authed_email
  FROM auth.users
  WHERE id = authed_user_id;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    currency,
    theme_preference,
    onboarding_completed,
    updated_at
  )
  VALUES (
    authed_user_id,
    COALESCE(authed_email, ''),
    NULLIF(BTRIM(full_name_input), ''),
    base_currency_input,
    'dark',
    TRUE,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(EXCLUDED.email, public.profiles.email),
      full_name = EXCLUDED.full_name,
      currency = EXCLUDED.currency,
      theme_preference = 'dark',
      onboarding_completed = TRUE,
      updated_at = NOW();

  INSERT INTO public.settings (
    user_id,
    salary_date,
    budget_warning_threshold,
    updated_at
  )
  VALUES (
    authed_user_id,
    salary_date_input,
    budget_warning_threshold_input,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET salary_date = EXCLUDED.salary_date,
      budget_warning_threshold = EXCLUDED.budget_warning_threshold,
      updated_at = NOW();

  INSERT INTO public.notification_preferences (
    user_id,
    salary_reminder,
    bonus_reminder,
    milestone_reminder,
    monthly_review_reminder,
    budget_warning,
    reconciliation_reminder,
    push_enabled,
    email_enabled,
    updated_at
  )
  VALUES (
    authed_user_id,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    browser_enabled_input,
    FALSE,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET salary_reminder = EXCLUDED.salary_reminder,
      bonus_reminder = EXCLUDED.bonus_reminder,
      milestone_reminder = EXCLUDED.milestone_reminder,
      monthly_review_reminder = EXCLUDED.monthly_review_reminder,
      budget_warning = EXCLUDED.budget_warning,
      reconciliation_reminder = EXCLUDED.reconciliation_reminder,
      push_enabled = EXCLUDED.push_enabled,
      email_enabled = EXCLUDED.email_enabled,
      updated_at = NOW();

  IF NOT EXISTS (
    SELECT 1
    FROM public.wallets
    WHERE user_id = authed_user_id
  ) THEN
    INSERT INTO public.wallets (user_id, name, currency, icon, color)
    VALUES (
      authed_user_id,
      default_wallet_name_input,
      base_currency_input,
      'wallet',
      '#3B82F6'
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_budget_with_items(TEXT, DECIMAL, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_transaction_with_wallet_impacts(UUID, UUID, UUID, TEXT, DECIMAL, UUID, TEXT, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_onboarding(TEXT, TEXT, TEXT, INTEGER, INTEGER, BOOLEAN) TO authenticated;
