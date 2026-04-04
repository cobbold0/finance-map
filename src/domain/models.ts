export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "GHS"
  | "KES"
  | "NGN"
  | "ZAR";

export type WalletType =
  | "checking"
  | "savings"
  | "cash"
  | "business"
  | "emergency_fund"
  | "project_wallet";

export type TransactionType =
  | "income"
  | "expense"
  | "transfer"
  | "salary"
  | "bonus"
  | "adjustment";

export type TransactionDisplayType =
  | TransactionType
  | "withdrawal";

export type GoalPriority = "low" | "medium" | "high";
export type GoalType = "generic" | "building_project";
export type GoalStatus = "active" | "paused" | "completed";
export type ReminderType =
  | "salary"
  | "bonus"
  | "milestone"
  | "monthly_review"
  | "budget_warning"
  | "reconciliation"
  | "custom";
export type ReminderFrequency =
  | "once"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";
export type BudgetWarningState = "healthy" | "watch" | "exceeded";
export type FinancialRecordType =
  | "pension_tier_1"
  | "pension_tier_2"
  | "pension_tier_3"
  | "investment"
  | "insurance"
  | "other";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  baseCurrency: CurrencyCode;
  themePreference: "dark";
  onboardingCompleted: boolean;
}

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  precision: number;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: CurrencyCode;
  quoteCurrency: CurrencyCode;
  rate: number;
  source: string;
  capturedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  nativeCurrency: CurrencyCode;
  balance: number;
  description: string | null;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  destinationWalletId: string | null;
  type: TransactionType;
  displayType: TransactionDisplayType;
  amount: number;
  nativeCurrency: CurrencyCode;
  convertedAmountBase: number | null;
  categoryId: string | null;
  category: string | null;
  tags: string[];
  notes: string | null;
  reference: string | null;
  occurredAt: string;
  importSource: string | null;
  reconciliationStatus: "matched" | "pending" | "flagged";
}

export interface TransactionCategory {
  id: string;
  userId: string;
  name: string;
  kind: "income" | "expense" | "transfer";
  color: string;
  icon: string;
  isSystem: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  month: string;
  totalLimit: number | null;
  rolloverPolicy: "reset" | "rollover";
  warningThreshold: number;
  status: "draft" | "active" | "closed";
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  warningState: BudgetWarningState;
}

export interface Goal {
  id: string;
  userId: string;
  walletId: string | null;
  name: string;
  description: string | null;
  targetAmount: number;
  savedAmount: number;
  targetDate: string | null;
  priority: GoalPriority;
  type: GoalType;
  status: GoalStatus;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  targetAmount: number | null;
  dueDate: string | null;
  isCompleted: boolean;
  notes: string | null;
}

export interface GoalPhase {
  id: string;
  goalId: string;
  order: number;
  title: string;
  description: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  status: "planned" | "in_progress" | "completed";
  completionDate: string | null;
}

export interface NotificationPreference {
  userId: string;
  inAppEnabled: boolean;
  browserEnabled: boolean;
  salaryReminder: boolean;
  bonusReminder: boolean;
  milestoneReminder: boolean;
  monthlyReviewReminder: boolean;
  budgetWarningReminder: boolean;
  reconciliationReminder: boolean;
}

export interface Reminder {
  id: string;
  userId: string;
  kind: ReminderType;
  title: string;
  description: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  scheduledFor: string | null;
  status: "scheduled" | "dismissed" | "sent";
  frequency: ReminderFrequency | null;
  lastTriggeredAt: string | null;
}

export interface BankAccountDetail {
  id: string;
  userId: string;
  label: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string | null;
  swiftCode: string | null;
  mobileMoneyProvider: string | null;
  mobileMoneyNumber: string | null;
  notes: string | null;
  isPrimary: boolean;
}

export interface FinancialRecord {
  id: string;
  userId: string;
  type: FinancialRecordType;
  label: string;
  providerName: string;
  productName: string | null;
  referenceNumber: string | null;
  currency: CurrencyCode;
  monthlyContribution: number | null;
  currentValue: number | null;
  coverageAmount: number | null;
  startDate: string | null;
  maturityDate: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  notes: string | null;
}

export interface AuditLog {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface TransactionFilters {
  query?: string;
  walletId?: string;
  category?: string;
  type?: TransactionType | "all";
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportFilters {
  walletId?: string;
  monthRange?: string;
  category?: string;
}

export interface DashboardSnapshot {
  totalBalanceBase: number;
  totalIncomeBase: number;
  totalExpenseBase: number;
  totalInvestmentsBase: number;
  savingsRate: number;
  walletCount: number;
  quickWallets: Wallet[];
  activeGoals: Goal[];
  recentTransactions: Transaction[];
  alerts: Reminder[];
  budgetHealth: {
    month: string;
    spent: number;
    limit: number;
    state: BudgetWarningState;
  } | null;
}

export interface WalletDetailSnapshot {
  wallet: Wallet;
  recentTransactions: Transaction[];
}

export interface BudgetOverviewSnapshot {
  currentBudget: Budget | null;
  categories: BudgetCategory[];
}

export interface GoalDetailSnapshot {
  goal: Goal;
  milestones: GoalMilestone[];
  phases: GoalPhase[];
}

export interface ReportsSnapshot {
  summary: {
    income: number;
    expense: number;
    net: number;
  };
  trends: Array<{
    label: string;
    income: number;
    expense: number;
  }>;
  expenseDistribution: Array<{
    label: string;
    value: number;
  }>;
  walletPerformance: Array<{
    wallet: string;
    balance: number;
  }>;
  savingsIndicators: Array<{
    label: string;
    progress: number;
    amount: number;
  }>;
}

export interface ImportPreviewResult {
  rows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
}

export interface ExportBundle {
  exportedAt: string;
  profile: UserProfile | null;
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  reminders: Reminder[];
  bankAccounts: BankAccountDetail[];
}

export interface NotificationPermissionState {
  permission: NotificationPermission | "unsupported";
  canPrompt: boolean;
}

export interface ReminderTriggerPayload {
  title: string;
  body: string;
  url: string;
}

export interface BankAccountSharePayload {
  title: string;
  text: string;
}
