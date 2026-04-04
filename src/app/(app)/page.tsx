import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Landmark,
  PiggyBank,
  Receipt,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { MetricCard } from "@/components/app/metric-card";
import { NotificationPermissionCard } from "@/components/app/notification-permission-card";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import {
  calculateGoalProgress,
  formatCompactCurrency,
  formatCurrency,
  getTransactionDisplayLabel,
} from "@/domain/finance";
import { BudgetWarningState } from "@/domain/models";
import {
  getCurrentUserProfile,
  getDashboardSnapshot,
} from "@/data/finance-repository";
import { cn } from "@/lib/utils";

type SetupTask = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
  icon: ComponentType<{ className?: string }>;
};

const budgetStateCopy: Record<
  BudgetWarningState,
  { label: string; tone: string; barTone: string }
> = {
  healthy: {
    label: "On track",
    tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    barTone: "bg-emerald-400",
  },
  watch: {
    label: "Needs attention",
    tone: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    barTone: "bg-amber-400",
  },
  exceeded: {
    label: "Over limit",
    tone: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    barTone: "bg-rose-400",
  },
};

function getFirstName(fullName: string | null) {
  return fullName?.trim().split(/\s+/)[0] ?? "there";
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default async function DashboardPage() {
  const [profile, snapshot] = await Promise.all([
    getCurrentUserProfile(),
    getDashboardSnapshot(),
  ]);
  const currency = profile?.baseCurrency ?? "GHS";
  const firstName = getFirstName(profile?.fullName ?? null);
  const hasTransactions = snapshot.recentTransactions.length > 0;
  const hasBudget = Boolean(snapshot.budgetHealth);
  const hasGoals = snapshot.activeGoals.length > 0;
  const hasAlerts = snapshot.alerts.length > 0;

  const setupTasks: SetupTask[] = [
    {
      id: "wallet",
      title: snapshot.walletCount > 0 ? "Wallets are ready" : "Add your first wallet",
      description:
        snapshot.walletCount > 0
          ? `${pluralize(snapshot.walletCount, "wallet")} available for tracking.`
          : "Create a wallet so balances, goals, and transactions have a home.",
      href: snapshot.walletCount > 0 ? "/wallets" : "/wallets/new",
      cta: snapshot.walletCount > 0 ? "Review wallets" : "Create wallet",
      done: snapshot.walletCount > 0,
      icon: Landmark,
    },
    {
      id: "activity",
      title: hasTransactions ? "Activity is coming in" : "Record your first transaction",
      description: hasTransactions
        ? "Recent activity is now shaping your cash flow and reports."
        : "Log one income or expense so the dashboard can start telling a story.",
      href: hasTransactions ? "/transactions" : "/transactions/new",
      cta: hasTransactions ? "Open history" : "Add transaction",
      done: hasTransactions,
      icon: Receipt,
    },
    {
      id: "budget",
      title: hasBudget ? "Budget guardrails are active" : "Set this month’s budget",
      description: hasBudget
        ? "Your spending posture is now being monitored against a monthly limit."
        : "A monthly budget gives this dashboard useful warnings instead of empty space.",
      href: hasBudget ? "/budgets" : "/budgets/new",
      cta: hasBudget ? "Open budget" : "Create budget",
      done: hasBudget,
      icon: PiggyBank,
    },
    {
      id: "goal",
      title: hasGoals ? "A goal is in motion" : "Create a savings goal",
      description: hasGoals
        ? "Your active goal gives the dashboard something meaningful to rally around."
        : "Goals turn spare cash into progress instead of letting it disappear.",
      href: hasGoals ? "/goals" : "/goals/new",
      cta: hasGoals ? "Review goals" : "Create goal",
      done: hasGoals,
      icon: Target,
    },
  ];

  const completedSetupCount = setupTasks.filter((task) => task.done).length;
  const setupProgress = (completedSetupCount / setupTasks.length) * 100;
  const setupComplete = completedSetupCount === setupTasks.length;
  const nextTask = setupTasks.find((task) => !task.done) ?? setupTasks[0];
  const shouldShowNotificationPrompt = hasTransactions || hasBudget || hasGoals || hasAlerts;
  const budgetRatio = snapshot.budgetHealth
    ? (snapshot.budgetHealth.spent / Math.max(snapshot.budgetHealth.limit, 1)) * 100
    : 0;
  const budgetState = snapshot.budgetHealth
    ? budgetStateCopy[snapshot.budgetHealth.state]
    : null;
  const netCashflow = snapshot.totalIncomeBase - snapshot.totalExpenseBase;
  const leadGoal = snapshot.activeGoals[0] ?? null;
  const attentionCount =
    (budgetState && snapshot.budgetHealth?.state !== "healthy" ? 1 : 0) +
    snapshot.alerts.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Your money at a glance"
        description="See what is healthy, what needs attention, and what to do next without hunting around the app."
        action={
          <HeaderActionLink href="/settings/bank-accounts" icon={Landmark}>
            Bank details
          </HeaderActionLink>
        }
      />

      {setupComplete ? (
        <section>
          <Card className="overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <Badge className="w-fit border-primary/20 bg-primary/10 text-white">
                    Month overview
                  </Badge>
                  <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
                    Welcome back, {firstName}.
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    Your setup is complete. This section now tracks the month instead of onboarding.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-xl">
                    <Link href="/transactions/new">
                      Record activity
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/budgets">Review budget</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm text-muted-foreground">Month net</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatCompactCurrency(netCashflow, currency)}
                  </p>
                </div>
                <Link
                  href="/budgets"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">Budget posture</p>
                    {budgetState ? <Badge className={budgetState.tone}>{budgetState.label}</Badge> : null}
                  </div>
                  <p className="mt-2 text-2xl font-semibold">
                    {snapshot.budgetHealth
                      ? `${formatCompactCurrency(snapshot.budgetHealth.spent, currency)} / ${formatCompactCurrency(snapshot.budgetHealth.limit, currency)}`
                      : "No budget"}
                  </p>
                </Link>
                <Link
                  href={leadGoal ? `/goals/${leadGoal.id}` : "/goals"}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                >
                  <p className="text-sm text-muted-foreground">Lead goal</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {leadGoal ? leadGoal.name : "No active goal"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {leadGoal
                      ? `${Math.round(calculateGoalProgress(leadGoal))}% funded`
                      : "Create a goal to track progress."}
                  </p>
                </Link>
                <Link
                  href={hasAlerts ? "/notifications" : "/transactions"}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                >
                  <p className="text-sm text-muted-foreground">Attention queue</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {attentionCount ? pluralize(attentionCount, "item") : "Clear"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {hasAlerts
                      ? snapshot.alerts[0]?.title ?? "Open notifications"
                      : "No urgent reminders right now."}
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
            <CardContent className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <Badge className="w-fit border-primary/20 bg-primary/10 text-primary-foreground">
                  Focus board
                </Badge>
                <div className="space-y-3">
                  <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                    Welcome, {firstName}. Let&apos;s make this dashboard useful fast.
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    You&apos;ve completed {completedSetupCount} of {setupTasks.length} foundation moves.
                    Finish the next one and this dashboard becomes dramatically more informative.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Setup progress</span>
                    <span className="font-medium">{Math.round(setupProgress)}%</span>
                  </div>
                  <Progress value={setupProgress} className="h-2.5 bg-white/12" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-xl">
                    <Link href={nextTask.href}>
                      {nextTask.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl">
                    <Link href="/transactions/new">Record activity</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 self-start">
                {setupTasks.map((task) => {
                  const Icon = task.icon;

                  return (
                    <Link
                      key={task.id}
                      href={task.href}
                      className={cn(
                        "rounded-2xl border px-4 py-4 transition",
                        task.done
                          ? "border-emerald-400/15 bg-emerald-400/[0.08] hover:bg-emerald-400/[0.11]"
                          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl",
                            task.done ? "bg-emerald-400/15 text-emerald-200" : "bg-white/8 text-foreground",
                          )}
                        >
                          {task.done ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{task.title}</p>
                            <Badge
                              className={cn(
                                task.done
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                                  : "border-white/10 bg-white/[0.06] text-muted-foreground",
                              )}
                            >
                              {task.done ? "Done" : "Next"}
                            </Badge>
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BellRing className="h-4 w-4 text-primary" />
                  What to watch
                </div>
                <p className="text-sm text-muted-foreground">
                  A quick read on the parts of your money system that need attention right now.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-muted-foreground">Budget posture</p>
                  {snapshot.budgetHealth && budgetState ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-2xl font-semibold">
                          {formatCompactCurrency(snapshot.budgetHealth.spent, currency)}
                        </p>
                        <Badge className={budgetState.tone}>{budgetState.label}</Badge>
                      </div>
                      <Progress
                        value={budgetRatio}
                        className={cn(
                          "h-2.5 bg-white/10 [&>div]:bg-primary",
                          budgetState.barTone === "bg-emerald-400" && "[&>div]:bg-emerald-400",
                          budgetState.barTone === "bg-amber-400" && "[&>div]:bg-amber-400",
                          budgetState.barTone === "bg-rose-400" && "[&>div]:bg-rose-400",
                        )}
                      />
                      <p className="text-sm text-muted-foreground">
                        {formatCompactCurrency(snapshot.budgetHealth.limit, currency)} set for the month
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <p className="font-medium">No budget guardrails yet</p>
                      <p className="text-sm text-muted-foreground">
                        Create a monthly budget so this space can warn you before spending drifts.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-muted-foreground">Activity signal</p>
                  <p className="mt-3 text-2xl font-semibold">
                    {hasTransactions
                      ? pluralize(snapshot.recentTransactions.length, "recent entry", "recent entries")
                      : "No activity yet"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {hasTransactions
                      ? "You have enough activity to start shaping cash-flow insights."
                      : "Record one transaction and the dashboard stops feeling empty."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {shouldShowNotificationPrompt ? <NotificationPermissionCard /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total balance"
          value={snapshot.totalBalanceBase}
          currency={currency}
          trend="up"
          detail={`${pluralize(snapshot.walletCount, "wallet")} connected`}
        />
        <MetricCard
          title="Income"
          value={snapshot.totalIncomeBase}
          currency={currency}
          trend="up"
          detail="Money in across recorded activity"
        />
        <MetricCard
          title="Expense"
          value={snapshot.totalExpenseBase}
          currency={currency}
          trend="down"
          detail="Money out across recorded activity"
        />
        <MetricCard
          title="Investments"
          value={snapshot.totalInvestmentsBase}
          currency={currency}
          trend="up"
          detail="Tracked long-term assets and pensions"
        />
        <MetricCard
          title="Savings rate"
          value={snapshot.savingsRate}
          format="percent"
          detail="Share of income kept after expenses"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Wallets</h2>
                <p className="text-sm text-muted-foreground">
                  Where your money currently lives
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/wallets">View all</Link>
              </Button>
            </div>
            {snapshot.quickWallets.length ? (
              <div className="grid gap-3 md:grid-cols-3">
                {snapshot.quickWallets.map((wallet) => (
                  <Link
                    key={wallet.id}
                    href={`/wallets/${wallet.id}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
                  >
                    <p className="text-sm text-muted-foreground">{wallet.name}</p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatCurrency(wallet.balance, wallet.nativeCurrency)}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Open wallet
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No wallets yet"
                description="Create your first wallet to start recording money movement with a clean audit trail."
                action={
                  <Button asChild>
                    <Link href="/wallets/new">Create wallet</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Goals and alerts</h2>
                <p className="text-sm text-muted-foreground">
                  The promises you are keeping and the reminders you should not miss
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/goals">Open goals</Link>
              </Button>
            </div>
            {hasGoals || hasAlerts ? (
              <div className="space-y-3">
                {snapshot.activeGoals.map((goal) => (
                  <Link
                    key={goal.id}
                    href={`/goals/${goal.id}`}
                    className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(calculateGoalProgress(goal))}%
                      </p>
                    </div>
                    <Progress value={calculateGoalProgress(goal)} className="mt-3" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {formatCurrency(goal.savedAmount, currency)} saved of{" "}
                      {formatCurrency(goal.targetAmount, currency)}
                    </p>
                  </Link>
                ))}
                {snapshot.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-primary" />
                      <p className="font-medium">{alert.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {alert.description ?? "Reminder ready"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing is actively pulling your attention yet"
                description="Add a goal or create reminders once your basic setup is complete so this area becomes a planning surface instead of dead space."
                action={
                  <Button asChild>
                    <Link href="/goals/new">Create goal</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recent transactions</h2>
                <p className="text-sm text-muted-foreground">
                  The latest money movement feeding your reports and balances
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/transactions">History</Link>
              </Button>
            </div>
            {hasTransactions ? (
              <div className="space-y-3">
                {snapshot.recentTransactions.map((transaction) => (
                  <Link
                    key={transaction.id}
                    href={`/transactions/${transaction.id}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {transaction.category ?? getTransactionDisplayLabel(transaction)}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {transaction.notes ?? "No notes"}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-semibold">
                        {formatCurrency(transaction.amount, transaction.nativeCurrency)}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {getTransactionDisplayLabel(transaction)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No transactions yet"
                description="Income, expenses, and transfers will appear here once you record activity. One entry is enough to make the dashboard feel alive."
                action={
                  <Button asChild>
                    <Link href="/transactions/new">Add transaction</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
