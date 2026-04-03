-- Seed Demo Data for Finance Map
-- One-off remote seed migration for the linked project.

DO $$
DECLARE
  demo_user_id UUID;
  current_month TEXT := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  previous_month TEXT := TO_CHAR((CURRENT_DATE - INTERVAL '1 month'), 'YYYY-MM');
  two_months_ago TEXT := TO_CHAR((CURRENT_DATE - INTERVAL '2 month'), 'YYYY-MM');
  checking_wallet_id UUID;
  savings_wallet_id UUID;
  emergency_wallet_id UUID;
  business_wallet_id UUID;
  cash_wallet_id UUID;
  project_wallet_id UUID;
  current_budget_id UUID;
  previous_budget_id UUID;
  renovation_goal_id UUID;
  emergency_goal_id UUID;
BEGIN
  SELECT id INTO demo_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth.users row found. Create a user before running seed migration.';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, currency, theme_preference)
  SELECT
    u.id,
    COALESCE(u.email, 'demo@financemap.local'),
    COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), 'Demo User'),
    'GHS',
    'dark'
  FROM auth.users u
  WHERE u.id = demo_user_id
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    currency = EXCLUDED.currency,
    theme_preference = EXCLUDED.theme_preference;

  INSERT INTO public.settings (user_id, salary_date, monthly_salary, bonus_schedule)
  VALUES (demo_user_id, 25, 12500.00, 'Quarterly performance bonus')
  ON CONFLICT (user_id) DO UPDATE
  SET
    salary_date = EXCLUDED.salary_date,
    monthly_salary = EXCLUDED.monthly_salary,
    bonus_schedule = EXCLUDED.bonus_schedule;

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

  INSERT INTO public.wallets (user_id, name, description, balance, currency, icon, color, is_archived)
  SELECT demo_user_id, v.name, v.description, v.balance, v.currency, v.icon, v.color, false
  FROM (
    VALUES
      ('Main Checking', 'Primary wallet for salary, bills, and everyday spending.', 18250.00, 'GHS', 'wallet', '#3B82F6'),
      ('Savings Vault', 'Dedicated savings bucket for medium-term goals.', 9400.00, 'GHS', 'piggy-bank', '#10B981'),
      ('Emergency Fund', 'Ring-fenced reserve for unexpected shocks.', 27500.00, 'GHS', 'shield', '#F59E0B'),
      ('Business Float', 'Operating cash for side projects and client work.', 6100.00, 'USD', 'briefcase', '#8B5CF6'),
      ('Cash Wallet', 'Cash on hand for transport and small local expenses.', 650.00, 'GHS', 'banknote', '#F97316'),
      ('Renovation Project', 'Project wallet for apartment improvements.', 3800.00, 'GHS', 'hammer', '#14B8A6')
  ) AS v(name, description, balance, currency, icon, color)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.wallets w
    WHERE w.user_id = demo_user_id
      AND w.name = v.name
  );

  SELECT id INTO checking_wallet_id
  FROM public.wallets
  WHERE user_id = demo_user_id AND name = 'Main Checking'
  LIMIT 1;

  SELECT id INTO savings_wallet_id
  FROM public.wallets
  WHERE user_id = demo_user_id AND name = 'Savings Vault'
  LIMIT 1;

  SELECT id INTO emergency_wallet_id
  FROM public.wallets
  WHERE user_id = demo_user_id AND name = 'Emergency Fund'
  LIMIT 1;

  SELECT id INTO business_wallet_id
  FROM public.wallets
  WHERE user_id = demo_user_id AND name = 'Business Float'
  LIMIT 1;

  SELECT id INTO cash_wallet_id
  FROM public.wallets
  WHERE user_id = demo_user_id AND name = 'Cash Wallet'
  LIMIT 1;

  SELECT id INTO project_wallet_id
  FROM public.wallets
  WHERE user_id = demo_user_id AND name = 'Renovation Project'
  LIMIT 1;

  INSERT INTO public.budget_categories (user_id, name, icon, color)
  SELECT demo_user_id, c.name, c.icon, c.color
  FROM (
    VALUES
      ('Housing', 'home', '#60A5FA'),
      ('Food & Groceries', 'shopping-cart', '#34D399'),
      ('Transportation', 'car', '#F59E0B'),
      ('Utilities', 'zap', '#F97316'),
      ('Healthcare', 'heart-pulse', '#EF4444'),
      ('Shopping', 'shopping-bag', '#EC4899'),
      ('Entertainment', 'film', '#A78BFA'),
      ('Savings', 'piggy-bank', '#14B8A6'),
      ('Business', 'briefcase', '#8B5CF6'),
      ('Education', 'book-open', '#22C55E')
  ) AS c(name, icon, color)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.budget_categories bc
    WHERE bc.user_id = demo_user_id
      AND bc.name = c.name
  );

  INSERT INTO public.transactions (
    user_id,
    wallet_id,
    destination_wallet_id,
    amount,
    type,
    category,
    description,
    date,
    is_recurring
  )
  SELECT
    demo_user_id,
    CASE t.wallet_name
      WHEN 'Main Checking' THEN checking_wallet_id
      WHEN 'Savings Vault' THEN savings_wallet_id
      WHEN 'Emergency Fund' THEN emergency_wallet_id
      WHEN 'Business Float' THEN business_wallet_id
      WHEN 'Cash Wallet' THEN cash_wallet_id
      WHEN 'Renovation Project' THEN project_wallet_id
      ELSE checking_wallet_id
    END,
    CASE t.destination_wallet_name
      WHEN 'Main Checking' THEN checking_wallet_id
      WHEN 'Savings Vault' THEN savings_wallet_id
      WHEN 'Emergency Fund' THEN emergency_wallet_id
      WHEN 'Business Float' THEN business_wallet_id
      WHEN 'Cash Wallet' THEN cash_wallet_id
      WHEN 'Renovation Project' THEN project_wallet_id
      ELSE NULL
    END,
    t.amount,
    t.type,
    t.category,
    t.description,
    t.tx_date,
    t.is_recurring
  FROM (
    VALUES
      ('Main Checking', NULL, 12500.00, 'salary', 'Income', 'Monthly salary payout', NOW() - INTERVAL '65 days', true),
      ('Main Checking', 'Savings Vault', 1500.00, 'transfer', 'Savings', 'Automatic transfer to savings', NOW() - INTERVAL '63 days', true),
      ('Main Checking', NULL, 950.00, 'expense', 'Housing', 'Rent contribution top-up', NOW() - INTERVAL '60 days', false),
      ('Main Checking', NULL, 420.35, 'expense', 'Food & Groceries', 'Monthly grocery restock', NOW() - INTERVAL '58 days', false),
      ('Cash Wallet', NULL, 85.00, 'expense', 'Transportation', 'Trotro and taxi cash', NOW() - INTERVAL '56 days', false),
      ('Business Float', NULL, 1800.00, 'income', 'Business', 'Client website deposit', NOW() - INTERVAL '53 days', false),
      ('Business Float', NULL, 320.00, 'expense', 'Business', 'Domain renewals and SaaS tools', NOW() - INTERVAL '50 days', false),
      ('Main Checking', NULL, 220.00, 'expense', 'Utilities', 'Electricity and water', NOW() - INTERVAL '48 days', true),
      ('Main Checking', NULL, 150.00, 'expense', 'Entertainment', 'Family dinner night out', NOW() - INTERVAL '45 days', false),
      ('Main Checking', NULL, 12500.00, 'salary', 'Income', 'Monthly salary payout', NOW() - INTERVAL '35 days', true),
      ('Main Checking', NULL, 2400.00, 'bonus', 'Income', 'Quarterly performance bonus', NOW() - INTERVAL '34 days', false),
      ('Main Checking', 'Emergency Fund', 1200.00, 'transfer', 'Savings', 'Emergency reserve contribution', NOW() - INTERVAL '33 days', false),
      ('Main Checking', 'Renovation Project', 950.00, 'transfer', 'Savings', 'Project wallet funding', NOW() - INTERVAL '31 days', false),
      ('Main Checking', NULL, 510.60, 'expense', 'Food & Groceries', 'Bulk grocery and market spend', NOW() - INTERVAL '28 days', false),
      ('Main Checking', NULL, 260.00, 'expense', 'Healthcare', 'Annual dental review', NOW() - INTERVAL '26 days', false),
      ('Main Checking', NULL, 140.00, 'expense', 'Shopping', 'Household organizers', NOW() - INTERVAL '23 days', false),
      ('Cash Wallet', NULL, 120.00, 'expense', 'Transportation', 'Fuel and station snacks', NOW() - INTERVAL '21 days', false),
      ('Business Float', NULL, 950.00, 'income', 'Business', 'Invoice settlement from consulting', NOW() - INTERVAL '19 days', false),
      ('Renovation Project', NULL, 600.00, 'expense', 'Housing', 'Kitchen mood board and measurements', NOW() - INTERVAL '18 days', false),
      ('Main Checking', NULL, 230.00, 'expense', 'Utilities', 'Internet and power bundle', NOW() - INTERVAL '15 days', true),
      ('Main Checking', NULL, 12500.00, 'salary', 'Income', 'Monthly salary payout', NOW() - INTERVAL '8 days', true),
      ('Main Checking', 'Savings Vault', 1700.00, 'transfer', 'Savings', 'Month-start savings allocation', NOW() - INTERVAL '7 days', true),
      ('Main Checking', NULL, 180.00, 'expense', 'Transportation', 'Ride-hailing for client meetings', NOW() - INTERVAL '6 days', false),
      ('Main Checking', NULL, 470.00, 'expense', 'Food & Groceries', 'Fresh produce and pantry refill', NOW() - INTERVAL '5 days', false),
      ('Main Checking', NULL, 95.00, 'expense', 'Entertainment', 'Streaming and movie rental', NOW() - INTERVAL '4 days', true),
      ('Main Checking', NULL, 380.00, 'expense', 'Shopping', 'Office chair accessories', NOW() - INTERVAL '3 days', false),
      ('Business Float', NULL, 450.00, 'expense', 'Business', 'Freelance subcontractor payment', NOW() - INTERVAL '2 days', false),
      ('Renovation Project', NULL, 1250.00, 'expense', 'Housing', 'Tile samples and contractor deposit', NOW() - INTERVAL '1 days', false)
  ) AS t(wallet_name, destination_wallet_name, amount, type, category, description, tx_date, is_recurring)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.transactions tx
    WHERE tx.user_id = demo_user_id
      AND tx.description = t.description
      AND tx.amount = t.amount
      AND tx.date = t.tx_date
  );

  INSERT INTO public.goals (
    user_id,
    name,
    description,
    target_amount,
    current_amount,
    target_date,
    priority,
    goal_type,
    status,
    is_linked_to_wallet,
    linked_wallet_id
  )
  SELECT
    demo_user_id,
    g.name,
    g.description,
    g.target_amount,
    g.current_amount,
    g.target_date,
    g.priority,
    g.goal_type,
    g.status,
    g.is_linked_to_wallet,
    CASE
      WHEN g.wallet_name = 'Savings Vault' THEN savings_wallet_id
      WHEN g.wallet_name = 'Emergency Fund' THEN emergency_wallet_id
      WHEN g.wallet_name = 'Renovation Project' THEN project_wallet_id
      ELSE NULL
    END
  FROM (
    VALUES
      ('Emergency runway', 'Grow the emergency buffer to cover at least nine months of fixed costs.', 40000.00, 27500.00, TIMESTAMPTZ '2027-03-31 00:00:00+00', 'high', 'generic', 'active', true, 'Emergency Fund'),
      ('Studio upgrade', 'Upgrade core work equipment and backup power for deeper focus.', 12000.00, 5400.00, TIMESTAMPTZ '2026-11-30 00:00:00+00', 'medium', 'generic', 'active', true, 'Savings Vault'),
      ('Renovation project', 'Refresh the apartment kitchen and guest room in planned phases.', 24000.00, 3800.00, TIMESTAMPTZ '2027-06-30 00:00:00+00', 'high', 'building_project', 'active', true, 'Renovation Project'),
      ('December travel fund', 'Build a calm year-end travel budget without touching operating cash.', 8000.00, 2100.00, TIMESTAMPTZ '2026-12-10 00:00:00+00', 'medium', 'generic', 'active', false, NULL)
  ) AS g(name, description, target_amount, current_amount, target_date, priority, goal_type, status, is_linked_to_wallet, wallet_name)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.goals goal
    WHERE goal.user_id = demo_user_id
      AND goal.name = g.name
  );

  SELECT id INTO renovation_goal_id
  FROM public.goals
  WHERE user_id = demo_user_id
    AND name = 'Renovation project'
  LIMIT 1;

  SELECT id INTO emergency_goal_id
  FROM public.goals
  WHERE user_id = demo_user_id
    AND name = 'Emergency runway'
  LIMIT 1;

  INSERT INTO public.goal_milestones (goal_id, name, target_amount, target_date, is_completed, notes)
  SELECT renovation_goal_id, m.name, m.target_amount, m.target_date, m.is_completed, m.notes
  FROM (
    VALUES
      ('Concept and planning', 2000.00, TIMESTAMPTZ '2026-06-15 00:00:00+00', true, 'Mood board, measurements, and contractor shortlist done.'),
      ('Materials locked', 9000.00, TIMESTAMPTZ '2026-11-30 00:00:00+00', false, 'Need final tile, cabinet, and paint selections.'),
      ('Install and finishing', 24000.00, TIMESTAMPTZ '2027-06-15 00:00:00+00', false, 'Final install, punch list, and styling.')
  ) AS m(name, target_amount, target_date, is_completed, notes)
  WHERE renovation_goal_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.goal_milestones gm
      WHERE gm.goal_id = renovation_goal_id
        AND gm.name = m.name
    );

  INSERT INTO public.goal_milestones (goal_id, name, target_amount, target_date, is_completed, notes)
  SELECT emergency_goal_id, m.name, m.target_amount, m.target_date, m.is_completed, m.notes
  FROM (
    VALUES
      ('Six-month coverage', 30000.00, TIMESTAMPTZ '2026-09-30 00:00:00+00', false, 'Almost there, keep monthly transfers steady.'),
      ('Nine-month coverage', 40000.00, TIMESTAMPTZ '2027-03-31 00:00:00+00', false, 'Final target for the runway goal.')
  ) AS m(name, target_amount, target_date, is_completed, notes)
  WHERE emergency_goal_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.goal_milestones gm
      WHERE gm.goal_id = emergency_goal_id
        AND gm.name = m.name
    );

  INSERT INTO public.roadmap_phases (
    goal_id,
    phase_number,
    name,
    description,
    estimated_cost,
    actual_cost,
    is_completed,
    completion_date,
    notes
  )
  SELECT renovation_goal_id, p.phase_number, p.name, p.description, p.estimated_cost, p.actual_cost, p.is_completed, p.completion_date, p.notes
  FROM (
    VALUES
      (1, 'Discovery', 'Research layout constraints, budget bands, and suppliers.', 1500.00, 950.00, true, NOW() - INTERVAL '12 days', 'Concept direction approved.'),
      (2, 'Procurement', 'Finalize quotes and purchase priority materials.', 9500.00, 0.00, false, NULL, 'Waiting on cabinet and tile negotiations.'),
      (3, 'Execution', 'Contractor work, install, paint, and finish styling.', 13000.00, 0.00, false, NULL, 'Main implementation phase.')
  ) AS p(phase_number, name, description, estimated_cost, actual_cost, is_completed, completion_date, notes)
  WHERE renovation_goal_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.roadmap_phases rp
      WHERE rp.goal_id = renovation_goal_id
        AND rp.phase_number = p.phase_number
    );

  INSERT INTO public.budgets (user_id, month, total_limit)
  VALUES
    (demo_user_id, two_months_ago, 7600.00),
    (demo_user_id, previous_month, 7800.00),
    (demo_user_id, current_month, 8200.00)
  ON CONFLICT (user_id, month) DO UPDATE
  SET total_limit = EXCLUDED.total_limit;

  SELECT id INTO current_budget_id
  FROM public.budgets
  WHERE user_id = demo_user_id
    AND month = current_month
  LIMIT 1;

  SELECT id INTO previous_budget_id
  FROM public.budgets
  WHERE user_id = demo_user_id
    AND month = previous_month
  LIMIT 1;

  INSERT INTO public.budget_items (budget_id, category_id, limit_amount, spent_amount)
  SELECT current_budget_id, bc.id, i.limit_amount, i.spent_amount
  FROM public.budget_categories bc
  JOIN (
    VALUES
      ('Housing', 1800.00, 1250.00),
      ('Food & Groceries', 1200.00, 980.00),
      ('Transportation', 700.00, 410.00),
      ('Utilities', 550.00, 230.00),
      ('Healthcare', 400.00, 260.00),
      ('Shopping', 500.00, 380.00),
      ('Entertainment', 280.00, 95.00),
      ('Savings', 1800.00, 1700.00),
      ('Business', 600.00, 450.00),
      ('Education', 370.00, 110.00)
  ) AS i(name, limit_amount, spent_amount)
    ON bc.name = i.name
  WHERE bc.user_id = demo_user_id
    AND current_budget_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.budget_items bi
      WHERE bi.budget_id = current_budget_id
        AND bi.category_id = bc.id
    );

  INSERT INTO public.budget_items (budget_id, category_id, limit_amount, spent_amount)
  SELECT previous_budget_id, bc.id, i.limit_amount, i.spent_amount
  FROM public.budget_categories bc
  JOIN (
    VALUES
      ('Housing', 1750.00, 1620.00),
      ('Food & Groceries', 1100.00, 1015.00),
      ('Transportation', 650.00, 520.00),
      ('Utilities', 500.00, 445.00),
      ('Healthcare', 300.00, 85.00),
      ('Shopping', 450.00, 275.00),
      ('Entertainment', 250.00, 160.00),
      ('Savings', 1600.00, 1500.00),
      ('Business', 550.00, 320.00),
      ('Education', 300.00, 70.00)
  ) AS i(name, limit_amount, spent_amount)
    ON bc.name = i.name
  WHERE bc.user_id = demo_user_id
    AND previous_budget_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.budget_items bi
      WHERE bi.budget_id = previous_budget_id
        AND bi.category_id = bc.id
    );

  INSERT INTO public.recurring_templates (
    user_id,
    name,
    type,
    amount,
    category,
    wallet_id,
    destination_wallet_id,
    frequency,
    day_of_month,
    is_active
  )
  SELECT demo_user_id, r.name, r.type, r.amount, r.category, r.wallet_id, r.destination_wallet_id, r.frequency, r.day_of_month, true
  FROM (
    VALUES
      ('Monthly salary', 'salary', 12500.00, 'Income', checking_wallet_id, NULL, 'monthly', 25),
      ('Savings sweep', 'transfer', 1700.00, 'Savings', checking_wallet_id, savings_wallet_id, 'monthly', 26),
      ('Utility block', 'expense', 230.00, 'Utilities', checking_wallet_id, NULL, 'monthly', 18)
  ) AS r(name, type, amount, category, wallet_id, destination_wallet_id, frequency, day_of_month)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.recurring_templates rt
    WHERE rt.user_id = demo_user_id
      AND rt.name = r.name
  );

  INSERT INTO public.reminders (
    user_id,
    type,
    title,
    description,
    scheduled_date,
    is_enabled,
    frequency,
    day_of_month,
    notification_time
  )
  SELECT demo_user_id, r.type, r.title, r.description, r.scheduled_date, true, r.frequency, r.day_of_month, r.notification_time
  FROM (
    VALUES
      ('salary', 'Salary landing reminder', 'Check your salary wallet inflow and allocate transfers.', CURRENT_DATE::timestamptz + TIME '08:00:00', 'monthly', 25, TIME '08:00:00'),
      ('bonus', 'Quarterly bonus review', 'Decide what portion of your bonus goes to goals versus reserves.', (CURRENT_DATE + INTERVAL '20 days')::timestamptz + TIME '09:30:00', 'quarterly', NULL, TIME '09:30:00'),
      ('monthly_review', 'Month-end finance review', 'Review budgets, active goals, and cash flow before the month closes.', (CURRENT_DATE + INTERVAL '10 days')::timestamptz + TIME '19:00:00', 'monthly', 28, TIME '19:00:00'),
      ('budget_warning', 'Budget pressure check', 'Groceries and shopping are approaching the planned cap.', (CURRENT_DATE + INTERVAL '3 days')::timestamptz + TIME '12:00:00', 'monthly', NULL, TIME '12:00:00'),
      ('reconciliation', 'Wallet reconciliation', 'Verify your checking, cash, and business balances against actual cash position.', (CURRENT_DATE + INTERVAL '7 days')::timestamptz + TIME '18:30:00', 'monthly', 30, TIME '18:30:00'),
      ('milestone', 'Renovation project milestone', 'Review supplier quotes before locking the materials phase.', (CURRENT_DATE + INTERVAL '14 days')::timestamptz + TIME '11:00:00', 'once', NULL, TIME '11:00:00')
  ) AS r(type, title, description, scheduled_date, frequency, day_of_month, notification_time)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.reminders reminder
    WHERE reminder.user_id = demo_user_id
      AND reminder.title = r.title
  );

  INSERT INTO public.bank_account_details (
    user_id,
    label,
    account_name,
    account_number,
    bank_name,
    branch,
    swift_code,
    mobile_money_provider,
    mobile_money_number,
    notes,
    is_primary
  )
  SELECT demo_user_id, b.label, b.account_name, b.account_number, b.bank_name, b.branch, b.swift_code, b.mobile_money_provider, b.mobile_money_number, b.notes, b.is_primary
  FROM (
    VALUES
      ('Primary current account', 'Finance Map Demo User', '0123456789012', 'GCB Bank', 'Airport Branch', 'GHCBGHAC', NULL, NULL, 'Main incoming salary account.', true),
      ('Project collections', 'Finance Map Demo User', '9988776655443', 'Ecobank Ghana', 'Osu Branch', 'ECOCGHAC', NULL, NULL, 'Used for client transfers and project collections.', false),
      ('Mobile money', 'Finance Map Demo User', '0241234567', 'MTN Mobile Money', NULL, NULL, 'MTN MoMo', '0241234567', 'Fast small transfers and emergency access.', false)
  ) AS b(label, account_name, account_number, bank_name, branch, swift_code, mobile_money_provider, mobile_money_number, notes, is_primary)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.bank_account_details bad
    WHERE bad.user_id = demo_user_id
      AND bad.label = b.label
  );

  INSERT INTO public.exchange_rates (base_currency, quote_currency, rate, source, captured_at)
  SELECT e.base_currency, e.quote_currency, e.rate, e.source, e.captured_at
  FROM (
    VALUES
      ('GHS', 'USD', 0.08250000, 'manual', NOW() - INTERVAL '1 day'),
      ('USD', 'GHS', 12.12121200, 'manual', NOW() - INTERVAL '1 day'),
      ('GHS', 'EUR', 0.07630000, 'manual', NOW() - INTERVAL '1 day'),
      ('EUR', 'GHS', 13.10615900, 'manual', NOW() - INTERVAL '1 day')
  ) AS e(base_currency, quote_currency, rate, source, captured_at)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.exchange_rates er
    WHERE er.base_currency = e.base_currency
      AND er.quote_currency = e.quote_currency
      AND er.source = e.source
  );

  INSERT INTO public.reconciliations (
    user_id,
    wallet_id,
    recorded_balance,
    actual_balance,
    notes,
    reconciliation_date
  )
  SELECT demo_user_id, checking_wallet_id, 18190.00, 18250.00, 'Minor adjustment after late card settlement.', NOW() - INTERVAL '6 days'
  WHERE checking_wallet_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.reconciliations r
      WHERE r.user_id = demo_user_id
        AND r.wallet_id = checking_wallet_id
        AND r.reconciliation_date::date = (NOW() - INTERVAL '6 days')::date
    );

  INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, summary, metadata)
  SELECT demo_user_id, a.entity_type, a.entity_id, a.action, a.summary, a.metadata
  FROM (
    VALUES
      ('wallet', checking_wallet_id, 'seeded', 'Primary wallet prepared for dashboard and transaction history.', jsonb_build_object('seed', 'demo')),
      ('goal', renovation_goal_id, 'seeded', 'Roadmap-based renovation goal populated with milestones and phases.', jsonb_build_object('seed', 'demo')),
      ('budget', current_budget_id, 'seeded', 'Current month budget seeded with ten spending categories.', jsonb_build_object('seed', 'demo')),
      ('notification_preferences', NULL::uuid, 'seeded', 'Notification controls initialized for browser and in-app reminders.', jsonb_build_object('seed', 'demo'))
  ) AS a(entity_type, entity_id, action, summary, metadata)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.audit_logs log
    WHERE log.user_id = demo_user_id
      AND log.action = a.action
      AND log.summary = a.summary
  );
END $$;
