CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Core tables

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'GHS',
  theme_preference TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  balance DECIMAL(20, 2) DEFAULT 0,
  currency TEXT DEFAULT 'GHS',
  icon TEXT DEFAULT 'wallet',
  color TEXT DEFAULT '#3B82F6',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'salary', 'bonus', 'adjustment')),
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  category TEXT,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_template_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  total_limit DECIMAL(20, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE TABLE public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  limit_amount DECIMAL(20, 2) NOT NULL,
  spent_amount DECIMAL(20, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(20, 2) NOT NULL,
  current_amount DECIMAL(20, 2) DEFAULT 0,
  target_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  goal_type TEXT DEFAULT 'generic' CHECK (goal_type IN ('generic', 'building_project')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  is_linked_to_wallet BOOLEAN DEFAULT FALSE,
  linked_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(20, 2),
  target_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.roadmap_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  phase_number INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  estimated_cost DECIMAL(20, 2),
  actual_cost DECIMAL(20, 2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.recurring_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'salary', 'bonus', 'adjustment')),
  amount DECIMAL(20, 2) NOT NULL,
  category TEXT,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  day_of_month INTEGER,
  month_offset INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('salary', 'bonus', 'milestone', 'monthly_review', 'budget_warning', 'reconciliation', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  is_enabled BOOLEAN DEFAULT TRUE,
  frequency TEXT CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  day_of_month INTEGER,
  notification_time TIME,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_delivery_status TEXT CHECK (last_delivery_status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  recorded_balance DECIMAL(20, 2) NOT NULL,
  actual_balance DECIMAL(20, 2) NOT NULL,
  discrepancy DECIMAL(20, 2) GENERATED ALWAYS AS (actual_balance - recorded_balance) STORED,
  adjustment_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  notes TEXT,
  reconciliation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  salary_reminder BOOLEAN DEFAULT TRUE,
  bonus_reminder BOOLEAN DEFAULT TRUE,
  milestone_reminder BOOLEAN DEFAULT TRUE,
  monthly_review_reminder BOOLEAN DEFAULT TRUE,
  budget_warning BOOLEAN DEFAULT TRUE,
  reconciliation_reminder BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  email_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  salary_date INTEGER,
  monthly_salary DECIMAL(20, 2),
  bonus_schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supporting tables

CREATE TABLE public.bank_account_details (
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

CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  quote_currency TEXT NOT NULL,
  rate DECIMAL(20, 8) NOT NULL,
  source TEXT DEFAULT 'manual',
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  content_encoding TEXT,
  user_agent TEXT,
  device_label TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE TABLE public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE,
  push_subscription_id UUID REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('browser_push', 'in_app')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reminder_id, push_subscription_id, channel, scheduled_for)
);

-- Indexes

CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_scheduled_enabled ON public.reminders(is_enabled, scheduled_date);
CREATE INDEX idx_recurring_templates_user_id ON public.recurring_templates(user_id);
CREATE INDEX idx_reconciliations_wallet_id ON public.reconciliations(wallet_id);
CREATE INDEX idx_bank_account_details_user_id ON public.bank_account_details(user_id);
CREATE INDEX idx_exchange_rates_base_quote ON public.exchange_rates(base_currency, quote_currency);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_notification_deliveries_user_id ON public.notification_deliveries(user_id);
CREATE INDEX idx_notification_deliveries_reminder_id ON public.notification_deliveries(reminder_id);
CREATE INDEX idx_notification_deliveries_status_scheduled_for ON public.notification_deliveries(status, scheduled_for);

-- RLS

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_account_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own wallets"
ON public.wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets"
ON public.wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
ON public.wallets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets"
ON public.wallets
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

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

CREATE POLICY "Users can delete their own transactions"
ON public.transactions
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own categories"
ON public.budget_categories
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
ON public.budget_categories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON public.budget_categories
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON public.budget_categories
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own budgets"
ON public.budgets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
ON public.budgets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
ON public.budgets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
ON public.budgets
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own budget_items"
ON public.budget_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.budgets
    WHERE budgets.id = budget_items.budget_id
      AND budgets.user_id = auth.uid()
  )
);

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

CREATE POLICY "Users can delete their budget_items"
ON public.budget_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.budgets
    WHERE budgets.id = budget_items.budget_id
      AND budgets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own goals"
ON public.goals
FOR SELECT
USING (auth.uid() = user_id);

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

CREATE POLICY "Users can delete their own goals"
ON public.goals
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their goal milestones"
ON public.goal_milestones
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = goal_milestones.goal_id
      AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert goal milestones"
ON public.goal_milestones
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = goal_milestones.goal_id
      AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update goal milestones"
ON public.goal_milestones
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = goal_milestones.goal_id
      AND goals.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = goal_milestones.goal_id
      AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete goal milestones"
ON public.goal_milestones
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = goal_milestones.goal_id
      AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their roadmap phases"
ON public.roadmap_phases
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = roadmap_phases.goal_id
      AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert roadmap phases"
ON public.roadmap_phases
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = roadmap_phases.goal_id
      AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update roadmap phases"
ON public.roadmap_phases
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = roadmap_phases.goal_id
      AND goals.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = roadmap_phases.goal_id
      AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete roadmap phases"
ON public.roadmap_phases
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.goals
    WHERE goals.id = roadmap_phases.goal_id
      AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their templates"
ON public.recurring_templates
FOR SELECT
USING (auth.uid() = user_id);

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

CREATE POLICY "Users can delete their own templates"
ON public.recurring_templates
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reminders"
ON public.reminders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
ON public.reminders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
ON public.reminders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
ON public.reminders
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reconciliations"
ON public.reconciliations
FOR SELECT
USING (auth.uid() = user_id);

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

CREATE POLICY "Users can delete their own reconciliations"
ON public.reconciliations
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification preferences"
ON public.notification_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
ON public.notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
ON public.notification_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own settings"
ON public.settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can view exchange rates"
ON public.exchange_rates
FOR SELECT
USING (true);

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own push subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification deliveries"
ON public.notification_deliveries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification deliveries"
ON public.notification_deliveries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Functions

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
