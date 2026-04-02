-- VaultFlow RLS Policies Migration

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can insert their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can update their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can delete their own wallets" ON public.wallets;
CREATE POLICY "Users can view their own wallets" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallets" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallets" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wallets" ON public.wallets FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.budget_categories;
CREATE POLICY "Users can view their own categories" ON public.budget_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON public.budget_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.budget_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.budget_categories FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;
CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own budget_items" ON public.budget_items;
DROP POLICY IF EXISTS "Users can insert budget_items for their budgets" ON public.budget_items;
DROP POLICY IF EXISTS "Users can update their budget_items" ON public.budget_items;
DROP POLICY IF EXISTS "Users can delete their budget_items" ON public.budget_items;
CREATE POLICY "Users can view their own budget_items" ON public.budget_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can insert budget_items for their budgets" ON public.budget_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can update their budget_items" ON public.budget_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can delete their budget_items" ON public.budget_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their goal milestones" ON public.goal_milestones;
DROP POLICY IF EXISTS "Users can insert goal milestones" ON public.goal_milestones;
DROP POLICY IF EXISTS "Users can update goal milestones" ON public.goal_milestones;
DROP POLICY IF EXISTS "Users can delete goal milestones" ON public.goal_milestones;
CREATE POLICY "Users can view their goal milestones" ON public.goal_milestones
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can insert goal milestones" ON public.goal_milestones
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can update goal milestones" ON public.goal_milestones
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can delete goal milestones" ON public.goal_milestones
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their roadmap phases" ON public.roadmap_phases;
DROP POLICY IF EXISTS "Users can insert roadmap phases" ON public.roadmap_phases;
DROP POLICY IF EXISTS "Users can update roadmap phases" ON public.roadmap_phases;
DROP POLICY IF EXISTS "Users can delete roadmap phases" ON public.roadmap_phases;
CREATE POLICY "Users can view their roadmap phases" ON public.roadmap_phases
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = roadmap_phases.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can insert roadmap phases" ON public.roadmap_phases
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = roadmap_phases.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can update roadmap phases" ON public.roadmap_phases
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = roadmap_phases.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can delete roadmap phases" ON public.roadmap_phases
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = roadmap_phases.goal_id AND goals.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their templates" ON public.recurring_templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON public.recurring_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.recurring_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.recurring_templates;
CREATE POLICY "Users can view their templates" ON public.recurring_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own templates" ON public.recurring_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.recurring_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.recurring_templates FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.reminders;
CREATE POLICY "Users can view their own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Users can insert their own reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Users can update their own reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Users can delete their own reconciliations" ON public.reconciliations;
CREATE POLICY "Users can view their own reconciliations" ON public.reconciliations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reconciliations" ON public.reconciliations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reconciliations" ON public.reconciliations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reconciliations" ON public.reconciliations FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;
CREATE POLICY "Users can view their own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);
