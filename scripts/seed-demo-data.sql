-- Seed Demo Data for VaultFlow
DO $$
DECLARE
  demo_user_id UUID;
  current_budget_id UUID;
  home_renovation_goal_id UUID;
  main_wallet_id UUID;
BEGIN
  SELECT id INTO demo_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth.users row found. Create a user before running seed-demo-data.sql.';
  END IF;

  INSERT INTO public.wallets (user_id, name, description, balance, currency, icon, color)
  SELECT demo_user_id, v.name, v.description, v.balance, 'GHS', v.icon, v.color
  FROM (
    VALUES
      ('Main Checking', 'Daily spending wallet', 5200.00, 'wallet', '#3B82F6'),
      ('Savings Goal', 'Short-term savings bucket', 8500.00, 'piggy-bank', '#10B981'),
      ('Emergency Fund', 'Reserved for emergencies only', 15000.00, 'shield', '#F59E0B')
  ) AS v(name, description, balance, icon, color)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.wallets w
    WHERE w.user_id = demo_user_id
      AND w.name = v.name
  );

  INSERT INTO public.budget_categories (user_id, name, icon, color)
  SELECT demo_user_id, c.name, c.icon, c.color
  FROM (
    VALUES
      ('Food & Groceries', 'cart', '#10B981'),
      ('Transportation', 'car', '#3B82F6'),
      ('Entertainment', 'film', '#8B5CF6'),
      ('Utilities', 'zap', '#F59E0B'),
      ('Healthcare', 'heart-pulse', '#EF4444'),
      ('Shopping', 'shopping-bag', '#EC4899')
  ) AS c(name, icon, color)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.budget_categories bc
    WHERE bc.user_id = demo_user_id
      AND bc.name = c.name
  );

  SELECT id INTO main_wallet_id
  FROM public.wallets
  WHERE user_id = demo_user_id
    AND name = 'Main Checking'
  LIMIT 1;

  INSERT INTO public.transactions (user_id, wallet_id, amount, type, category, description, date)
  SELECT demo_user_id, main_wallet_id, t.amount, t.type, t.category, t.description, t.date
  FROM (
    VALUES
      (2500.00, 'salary', 'Income', 'Monthly salary', NOW() - INTERVAL '25 days'),
      (180.45, 'expense', 'Food & Groceries', 'Grocery shopping', NOW() - INTERVAL '12 days'),
      (75.00, 'expense', 'Transportation', 'Ride to office', NOW() - INTERVAL '8 days'),
      (120.00, 'expense', 'Utilities', 'Electricity bill', NOW() - INTERVAL '5 days'),
      (300.00, 'expense', 'Shopping', 'Household supplies', NOW() - INTERVAL '2 days')
  ) AS t(amount, type, category, description, date)
  WHERE main_wallet_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.transactions tx
      WHERE tx.user_id = demo_user_id
        AND tx.wallet_id = main_wallet_id
        AND tx.description = t.description
        AND tx.amount = t.amount
    );

  INSERT INTO public.goals (user_id, name, description, target_amount, current_amount, target_date, priority, goal_type, status)
  SELECT demo_user_id, g.name, g.description, g.target_amount, g.current_amount, g.target_date, g.priority, g.goal_type, g.status
  FROM (
    VALUES
      ('Buy Laptop', 'New MacBook Pro for work', 8000.00, 3500.00, TIMESTAMPTZ '2026-12-31 00:00:00+00', 'high', 'generic', 'active'),
      ('Emergency Fund', 'Six months of expenses', 25000.00, 15000.00, TIMESTAMPTZ '2027-06-30 00:00:00+00', 'high', 'generic', 'active'),
      ('Vacation to Dubai', 'Trip in summer', 5000.00, 2000.00, TIMESTAMPTZ '2027-06-30 00:00:00+00', 'medium', 'generic', 'active'),
      ('Home Renovation', 'Kitchen and bedroom renovation', 15000.00, 4500.00, TIMESTAMPTZ '2027-12-31 00:00:00+00', 'high', 'building_project', 'active')
  ) AS g(name, description, target_amount, current_amount, target_date, priority, goal_type, status)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.goals goal
    WHERE goal.user_id = demo_user_id
      AND goal.name = g.name
  );

  SELECT id INTO home_renovation_goal_id
  FROM public.goals
  WHERE user_id = demo_user_id
    AND name = 'Home Renovation'
  LIMIT 1;

  INSERT INTO public.goal_milestones (goal_id, name, target_amount, target_date, is_completed)
  SELECT home_renovation_goal_id, m.name, m.target_amount, m.target_date, m.is_completed
  FROM (
    VALUES
      ('Design Phase', 2000.00, TIMESTAMPTZ '2026-08-31 00:00:00+00', true),
      ('Material Purchase', 6000.00, TIMESTAMPTZ '2027-02-28 00:00:00+00', false),
      ('Labor & Installation', 7000.00, TIMESTAMPTZ '2027-10-31 00:00:00+00', false)
  ) AS m(name, target_amount, target_date, is_completed)
  WHERE home_renovation_goal_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.goal_milestones gm
      WHERE gm.goal_id = home_renovation_goal_id
        AND gm.name = m.name
    );

  INSERT INTO public.budgets (user_id, month, total_limit)
  VALUES (demo_user_id, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 5000.00)
  ON CONFLICT (user_id, month) DO UPDATE
  SET total_limit = EXCLUDED.total_limit;

  SELECT id INTO current_budget_id
  FROM public.budgets
  WHERE user_id = demo_user_id
    AND month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
  LIMIT 1;

  INSERT INTO public.budget_items (budget_id, category_id, limit_amount, spent_amount)
  SELECT current_budget_id, bc.id, i.limit_amount, i.spent_amount
  FROM public.budget_categories bc
  JOIN (
    VALUES
      ('Food & Groceries', 800.00, 420.00),
      ('Transportation', 500.00, 210.00),
      ('Entertainment', 300.00, 95.00),
      ('Utilities', 400.00, 175.00),
      ('Healthcare', 200.00, 60.00),
      ('Shopping', 300.00, 140.00)
  ) AS i(name, limit_amount, spent_amount)
    ON i.name = bc.name
  WHERE bc.user_id = demo_user_id
    AND current_budget_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.budget_items bi
      WHERE bi.budget_id = current_budget_id
        AND bi.category_id = bc.id
    );

  INSERT INTO public.reminders (user_id, type, title, description, scheduled_date, frequency, day_of_month, notification_time, is_enabled)
  SELECT demo_user_id, r.type, r.title, r.description, r.scheduled_date, r.frequency, r.day_of_month, r.notification_time, true
  FROM (
    VALUES
      ('salary', 'Monthly Salary', 'Salary payment due today', CURRENT_DATE::timestamptz, 'monthly', 1, TIME '08:00:00'),
      ('monthly_review', 'Monthly Review', 'Review spending and adjust budgets', (CURRENT_DATE + INTERVAL '1 month')::timestamptz, 'monthly', 1, TIME '10:00:00'),
      ('reconciliation', 'Account Reconciliation', 'Reconcile all accounts and verify balances', (CURRENT_DATE + INTERVAL '1 month')::timestamptz, 'monthly', 15, TIME '14:00:00')
  ) AS r(type, title, description, scheduled_date, frequency, day_of_month, notification_time)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.reminders reminder
    WHERE reminder.user_id = demo_user_id
      AND reminder.title = r.title
  );

  INSERT INTO public.notification_preferences (
    user_id,
    salary_reminder,
    bonus_reminder,
    milestone_reminder,
    monthly_review_reminder,
    budget_warning,
    reconciliation_reminder,
    push_enabled,
    email_enabled
  )
  VALUES (demo_user_id, true, true, true, true, true, true, false, false)
  ON CONFLICT (user_id) DO UPDATE
  SET
    salary_reminder = EXCLUDED.salary_reminder,
    bonus_reminder = EXCLUDED.bonus_reminder,
    milestone_reminder = EXCLUDED.milestone_reminder,
    monthly_review_reminder = EXCLUDED.monthly_review_reminder,
    budget_warning = EXCLUDED.budget_warning,
    reconciliation_reminder = EXCLUDED.reconciliation_reminder,
    push_enabled = EXCLUDED.push_enabled,
    email_enabled = EXCLUDED.email_enabled;

  INSERT INTO public.settings (user_id, salary_date, monthly_salary)
  VALUES (demo_user_id, 1, 2500.00)
  ON CONFLICT (user_id) DO UPDATE
  SET
    salary_date = EXCLUDED.salary_date,
    monthly_salary = EXCLUDED.monthly_salary;
END $$;
