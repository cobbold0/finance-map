import { subMonths } from "date-fns";
import {
  Budget,
  BudgetCategory,
  BudgetOverviewSnapshot,
  DashboardSnapshot,
  ExportBundle,
  FinancialRecord,
  Goal,
  GoalDetailSnapshot,
  GoalMilestone,
  GoalPhase,
  NotificationPreference,
  Reminder,
  ReportsSnapshot,
  Transaction,
  TransactionFilters,
  UserProfile,
  Wallet,
  WalletDetailSnapshot,
} from "@/domain/models";
import {
  calculateBudgetState,
  convertToBaseCurrency,
  enrichBudgetCategory,
  getTransactionDisplayType,
  getIncomeVsExpense,
} from "@/domain/finance";
import { createClient } from "@/lib/supabase/server";

function parseAmount(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return 0;
}

function normalizeBudgetCategoryName(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
}

async function getAuthedSupabase() {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { supabase, user };
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return null;
  }

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("*")
    .eq("id", ctx.user.id)
    .maybeSingle();

  return {
    id: ctx.user.id,
    email: profile?.email ?? ctx.user.email ?? "",
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    baseCurrency: (profile?.currency ?? "GHS") as UserProfile["baseCurrency"],
    themePreference:
      (profile?.theme_preference as UserProfile["themePreference"] | undefined) ??
      "dark",
    onboardingCompleted: profile?.onboarding_completed ?? false,
  };
}

export async function getUserSettings(): Promise<{
  salaryDate: number | null;
  budgetWarningThreshold: number | null;
}> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return { salaryDate: null, budgetWarningThreshold: null };
  }

  const { data } = await ctx.supabase
    .from("settings")
    .select("salary_date, budget_warning_threshold")
    .eq("user_id", ctx.user.id)
    .maybeSingle();

  return {
    salaryDate:
      typeof data?.salary_date === "number" ? data.salary_date : null,
    budgetWarningThreshold:
      typeof data?.budget_warning_threshold === "number"
        ? data.budget_warning_threshold
        : null,
  };
}

export async function getWallets(): Promise<Wallet[]> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return [];
  }

  const { data } = await ctx.supabase
    .from("wallets")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: true });

  return (data ?? []).map((wallet) => ({
    id: wallet.id,
    userId: wallet.user_id,
    name: wallet.name,
    type: "checking",
    nativeCurrency: wallet.currency ?? "GHS",
    balance: parseAmount(wallet.balance),
    description: wallet.description,
    color: wallet.color ?? "#3B82F6",
    icon: wallet.icon ?? "wallet",
    isArchived: wallet.is_archived ?? false,
    createdAt: wallet.created_at,
    updatedAt: wallet.updated_at,
  }));
}

export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<Transaction[]> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return [];
  }

  let query = ctx.supabase
    .from("transactions")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("date", { ascending: false });

  if (filters.walletId) {
    query = query.eq("wallet_id", filters.walletId);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.dateFrom) {
    query = query.gte("date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("date", filters.dateTo);
  }

  const { data } = await query;

  return (data ?? [])
    .filter((transaction) => {
      const amount = parseAmount(transaction.amount);

      if (filters.minAmount && amount < filters.minAmount) {
        return false;
      }

      if (filters.maxAmount && amount > filters.maxAmount) {
        return false;
      }

      if (filters.query) {
        const haystack = `${transaction.description ?? ""} ${transaction.category ?? ""}`.toLowerCase();
        return haystack.includes(filters.query.toLowerCase());
      }

      return true;
    })
    .map((transaction) => {
      const destinationWalletId = transaction.destination_wallet_id ?? null;

      return {
        id: transaction.id,
        userId: transaction.user_id,
        walletId: transaction.wallet_id,
        destinationWalletId,
        type: transaction.type,
        displayType: getTransactionDisplayType({
          type: transaction.type,
          destinationWalletId,
        }),
        amount: parseAmount(transaction.amount),
        nativeCurrency: transaction.currency ?? "GHS",
        convertedAmountBase: parseAmount(transaction.amount),
        categoryId: transaction.category_id ?? null,
        category: transaction.category ?? null,
        tags: [],
        notes: transaction.description ?? null,
        reference: null,
        occurredAt: transaction.date,
        importSource: null,
        reconciliationStatus: "matched",
      };
    });
}

export async function getWalletDetail(
  walletId: string,
): Promise<WalletDetailSnapshot | null> {
  const wallets = await getWallets();
  const wallet = wallets.find((item) => item.id === walletId);

  if (!wallet) {
    return null;
  }

  const transactions = await getTransactions({ walletId });

  return {
    wallet,
    recentTransactions: transactions.slice(0, 8),
  };
}

export async function getGoals(): Promise<Goal[]> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return [];
  }

  const { data } = await ctx.supabase
    .from("goals")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("target_date", { ascending: true });

  return (data ?? []).map((goal) => ({
    id: goal.id,
    userId: goal.user_id,
    walletId: goal.linked_wallet_id ?? null,
    name: goal.name,
    description: goal.description ?? null,
    targetAmount: parseAmount(goal.target_amount),
    savedAmount: parseAmount(goal.current_amount),
    targetDate: goal.target_date ?? null,
    priority: goal.priority,
    type: goal.goal_type,
    status: goal.status,
  }));
}

export async function getGoalDetail(goalId: string): Promise<GoalDetailSnapshot | null> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return null;
  }

  const goals = await getGoals();
  const goal = goals.find((item) => item.id === goalId);

  if (!goal) {
    return null;
  }

  const { data: milestonesData } = await ctx.supabase
    .from("goal_milestones")
    .select("*")
    .eq("goal_id", goalId)
    .order("target_date", { ascending: true });

  const { data: phasesData } = await ctx.supabase
    .from("roadmap_phases")
    .select("*")
    .eq("goal_id", goalId)
    .order("phase_number", { ascending: true });

  const milestones: GoalMilestone[] = (milestonesData ?? []).map((milestone) => ({
    id: milestone.id,
    goalId: milestone.goal_id,
    title: milestone.name,
    targetAmount: milestone.target_amount ? parseAmount(milestone.target_amount) : null,
    dueDate: milestone.target_date ?? null,
    isCompleted: milestone.is_completed ?? false,
    notes: milestone.notes ?? null,
  }));

  const phases: GoalPhase[] = (phasesData ?? []).map((phase) => ({
    id: phase.id,
    goalId: phase.goal_id,
    order: phase.phase_number ?? 0,
    title: phase.name,
    description: phase.description ?? null,
    estimatedCost: phase.estimated_cost ? parseAmount(phase.estimated_cost) : null,
    actualCost: phase.actual_cost ? parseAmount(phase.actual_cost) : null,
    status: phase.is_completed ? "completed" : "planned",
    completionDate: phase.completion_date ?? null,
  }));

  return { goal, milestones, phases };
}

export async function getBudgetOverview(month = new Date().toISOString().slice(0, 7)): Promise<BudgetOverviewSnapshot> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return { currentBudget: null, categories: [] };
  }

  const { data: budgetRow } = await ctx.supabase
    .from("budgets")
    .select("*")
    .eq("user_id", ctx.user.id)
    .eq("month", month)
    .maybeSingle();

  if (!budgetRow) {
    return { currentBudget: null, categories: [] };
  }

  const { data: settingsRow } = await ctx.supabase
    .from("settings")
    .select("budget_warning_threshold")
    .eq("user_id", ctx.user.id)
    .maybeSingle();
  const warningThreshold = Math.max(
    0.5,
    Math.min(
      0.95,
      (typeof settingsRow?.budget_warning_threshold === "number"
        ? settingsRow.budget_warning_threshold
        : 80) / 100,
    ),
  );

  const budget: Budget = {
    id: budgetRow.id,
    userId: budgetRow.user_id,
    month: budgetRow.month,
    totalLimit: budgetRow.total_limit ? parseAmount(budgetRow.total_limit) : null,
    rolloverPolicy: "reset",
    warningThreshold,
    status: "active",
  };

  const { data: items } = await ctx.supabase
    .from("budget_items")
    .select("id, budget_id, category_id, limit_amount, spent_amount, budget_categories(name)")
    .eq("budget_id", budget.id);

  const transactions = await getTransactions({
    type: "expense",
  });
  const expenseByCategory = transactions.reduce((totals, transaction) => {
    if (!transaction.occurredAt.startsWith(month)) {
      return totals;
    }

    const categoryKey = transaction.categoryId ?? normalizeBudgetCategoryName(transaction.category);

    if (!categoryKey) {
      return totals;
    }

    totals.set(categoryKey, (totals.get(categoryKey) ?? 0) + transaction.amount);
    return totals;
  }, new Map<string, number>());

  const categories: BudgetCategory[] = (items ?? []).map((item) => {
    const categoryRelationship = item as {
      budget_categories?:
        | Array<{ name?: string }>
        | {
            name?: string;
          }
        | null;
    };
    const categoryName = Array.isArray(categoryRelationship.budget_categories)
      ? categoryRelationship.budget_categories[0]?.name
      : categoryRelationship.budget_categories?.name;
    const normalizedCategoryName = normalizeBudgetCategoryName(categoryName);

    return enrichBudgetCategory({
      id: item.id,
      budgetId: item.budget_id,
      categoryId: item.category_id,
      categoryName: categoryName ?? "Category",
      limitAmount: parseAmount(item.limit_amount),
      spentAmount:
        expenseByCategory.get(item.category_id) ??
        expenseByCategory.get(normalizedCategoryName) ??
        0,
      warningThreshold,
    });
  });

  return {
    currentBudget: budget,
    categories,
  };
}

export async function getBudgetCategories(): Promise<
  Array<{ id: string; name: string; color: string | null; icon: string | null }>
> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return [];
  }

  const { data } = await ctx.supabase
    .from("budget_categories")
    .select("id, name, color, icon")
    .eq("user_id", ctx.user.id)
    .order("name", { ascending: true });

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color ?? null,
    icon: category.icon ?? null,
  }));
}

export async function getBudgetCategory(categoryId: string): Promise<{
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
} | null> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return null;
  }

  const { data } = await ctx.supabase
    .from("budget_categories")
    .select("id, name, color, icon")
    .eq("id", categoryId)
    .eq("user_id", ctx.user.id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color ?? null,
    icon: data.icon ?? null,
  };
}

export async function getReminders(): Promise<Reminder[]> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return [];
  }

  const { data } = await ctx.supabase
    .from("reminders")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("scheduled_date", { ascending: true });

  return (data ?? []).map((reminder) => ({
    id: reminder.id,
    userId: reminder.user_id,
    kind: reminder.type,
    title: reminder.title,
    description: reminder.description ?? null,
    relatedEntityType: null,
    relatedEntityId: null,
    scheduledFor: reminder.scheduled_date ?? null,
    status: reminder.is_enabled ? "scheduled" : "dismissed",
    frequency: reminder.frequency ?? null,
    lastTriggeredAt: reminder.last_triggered_at ?? null,
  }));
}

export async function getNotificationDeliveries() {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return [];
  }

  const { data } = await ctx.supabase
    .from("notification_deliveries")
    .select("id, channel, status, scheduled_for, sent_at, error_message, reminder_id, reminders(title)")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []).map((delivery) => {
    const reminderRelationship = delivery as {
      reminders?:
        | Array<{ title?: string }>
        | {
            title?: string;
          }
        | null;
    };

    return {
      id: delivery.id,
      channel: delivery.channel,
      status: delivery.status,
      scheduledFor: delivery.scheduled_for,
      sentAt: delivery.sent_at,
      errorMessage: delivery.error_message,
      reminderTitle: Array.isArray(reminderRelationship.reminders)
        ? reminderRelationship.reminders[0]?.title ?? null
        : reminderRelationship.reminders?.title ?? null,
    };
  });
}

export async function getNotificationPreferences(): Promise<NotificationPreference | null> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return null;
  }

  const { data } = await ctx.supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", ctx.user.id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    userId: data.user_id,
    inAppEnabled: true,
    browserEnabled: data.push_enabled ?? false,
    salaryReminder: data.salary_reminder ?? false,
    bonusReminder: data.bonus_reminder ?? false,
    milestoneReminder: data.milestone_reminder ?? false,
    monthlyReviewReminder: data.monthly_review_reminder ?? false,
    budgetWarningReminder: data.budget_warning ?? false,
    reconciliationReminder: data.reconciliation_reminder ?? false,
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const profile = await getCurrentUserProfile();
  const baseCurrency = profile?.baseCurrency ?? "GHS";
  const [wallets, transactions, goals, budgetOverview, reminders, financialRecords] =
    await Promise.all([
      getWallets(),
      getTransactions(),
      getGoals(),
      getBudgetOverview(),
      getReminders(),
      getFinancialRecords(),
    ]);

  const { income, expense } = getIncomeVsExpense(transactions);
  const rates: never[] = [];

  const totalBalanceBase = wallets.reduce(
    (total, wallet) =>
      total +
      convertToBaseCurrency(
        wallet.balance,
        wallet.nativeCurrency,
        baseCurrency,
        rates,
      ),
    0,
  );

  const limit = budgetOverview.currentBudget?.totalLimit ?? 0;
  const spent = budgetOverview.categories.reduce(
    (total, category) => total + category.spentAmount,
    0,
  );
  const totalInvestmentsBase = financialRecords
    .filter((record) =>
      record.type === "investment" ||
      record.type === "pension_tier_1" ||
      record.type === "pension_tier_2" ||
      record.type === "pension_tier_3",
    )
    .reduce(
      (total, record) =>
        total +
        convertToBaseCurrency(
          record.currentValue ?? 0,
          record.currency,
          baseCurrency,
          rates,
        ),
      0,
    );

  return {
    totalBalanceBase,
    totalIncomeBase: income,
    totalExpenseBase: expense,
    totalInvestmentsBase,
    savingsRate:
      income > 0 ? Math.max(((income - expense) / income) * 100, 0) : 0,
    walletCount: wallets.length,
    quickWallets: wallets.slice(0, 3),
    activeGoals: goals.filter((goal) => goal.status === "active").slice(0, 3),
    recentTransactions: transactions.slice(0, 6),
    alerts: reminders.slice(0, 4),
    budgetHealth: budgetOverview.currentBudget
      ? {
          month: budgetOverview.currentBudget.month,
          spent,
          limit,
          state: calculateBudgetState(
            spent,
            limit || 1,
            budgetOverview.currentBudget.warningThreshold,
          ),
        }
      : null,
  };
}

export async function getReportsSnapshot(): Promise<ReportsSnapshot> {
  const profile = await getCurrentUserProfile();
  const baseCurrency = profile?.baseCurrency ?? "GHS";
  const [transactions, wallets, goals] = await Promise.all([
    getTransactions(),
    getWallets(),
    getGoals(),
  ]);

  const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
    const value = subMonths(new Date(), 5 - index);
    return value.toISOString().slice(0, 7);
  });

  const trends = lastSixMonths.map((month) => {
    const monthlyTransactions = transactions.filter((transaction) =>
      transaction.occurredAt.startsWith(month),
    );
    const totals = getIncomeVsExpense(monthlyTransactions);

    return {
      label: month,
      income: totals.income,
      expense: totals.expense,
    };
  });

  const expenseMap = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const key = transaction.category ?? "Other";
      expenseMap.set(key, (expenseMap.get(key) ?? 0) + transaction.amount);
    });

  return {
    summary: {
      income: trends.reduce((total, item) => total + item.income, 0),
      expense: trends.reduce((total, item) => total + item.expense, 0),
      net:
        trends.reduce((total, item) => total + item.income, 0) -
        trends.reduce((total, item) => total + item.expense, 0),
    },
    trends,
    expenseDistribution: Array.from(expenseMap.entries()).map(([label, value]) => ({
      label,
      value,
    })),
    walletPerformance: wallets.map((wallet) => ({
      wallet: wallet.name,
      balance: convertToBaseCurrency(
        wallet.balance,
        wallet.nativeCurrency,
        baseCurrency,
        [],
      ),
    })),
    savingsIndicators: goals.slice(0, 4).map((goal) => ({
      label: goal.name,
      progress:
        goal.targetAmount > 0
          ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
          : 0,
      amount: goal.savedAmount,
    })),
  };
}

export async function getBankAccounts() {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return [];
  }

  const { data, error } = await ctx.supabase
    .from("bank_account_details")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("is_primary", { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getFinancialRecords(): Promise<FinancialRecord[]> {
  const ctx = await getAuthedSupabase();

  if (!ctx) {
    return [];
  }

  const { data, error } = await ctx.supabase
    .from("financial_records")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []).map((record) => ({
    id: record.id,
    userId: record.user_id,
    type: record.record_type,
    label: record.label,
    providerName: record.provider_name,
    productName: record.product_name ?? null,
    referenceNumber: record.reference_number ?? null,
    currency: record.currency ?? "GHS",
    monthlyContribution: record.monthly_contribution
      ? parseAmount(record.monthly_contribution)
      : null,
    currentValue: record.current_value ? parseAmount(record.current_value) : null,
    coverageAmount: record.coverage_amount
      ? parseAmount(record.coverage_amount)
      : null,
    startDate: record.start_date ?? null,
    maturityDate: record.maturity_date ?? null,
    contactPerson: record.contact_person ?? null,
    contactPhone: record.contact_phone ?? null,
    notes: record.notes ?? null,
  }));
}

export async function getFinancialRecord(
  recordId: string,
): Promise<FinancialRecord | null> {
  const records = await getFinancialRecords();
  return records.find((record) => record.id === recordId) ?? null;
}

export async function getExportBundle(): Promise<ExportBundle> {
  const [profile, wallets, transactions, budgetOverview, goals, reminders, bankAccounts] =
    await Promise.all([
      getCurrentUserProfile(),
      getWallets(),
      getTransactions(),
      getBudgetOverview(),
      getGoals(),
      getReminders(),
      getBankAccounts(),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    profile,
    wallets,
    transactions,
    budgets: budgetOverview.currentBudget ? [budgetOverview.currentBudget] : [],
    goals,
    reminders,
    bankAccounts: bankAccounts.map((item) => ({
      id: item.id,
      userId: item.user_id,
      label: item.label,
      accountName: item.account_name,
      accountNumber: item.account_number,
      bankName: item.bank_name,
      branch: item.branch ?? null,
      swiftCode: item.swift_code ?? null,
      mobileMoneyProvider: item.mobile_money_provider ?? null,
      mobileMoneyNumber: item.mobile_money_number ?? null,
      notes: item.notes ?? null,
      isPrimary: item.is_primary ?? false,
    })),
  };
}
