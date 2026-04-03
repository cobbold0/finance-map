import Link from "next/link";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { MetricCard } from "@/components/app/metric-card";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { formatCompactCurrency, formatCurrency } from "@/domain/finance";
import { getCurrentUserProfile, getDashboardSnapshot } from "@/data/finance-repository";

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();
  const snapshot = await getDashboardSnapshot();
  const currency = profile?.baseCurrency ?? "GHS";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Your money at a glance"
        description="Track balances, cash flow, goals, budgets, and reminders from one calm operating layer."
        action={
          <HeaderActionLink href="/settings/bank-accounts" icon={Landmark}>
            Bank details
          </HeaderActionLink>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total balance" value={snapshot.totalBalanceBase} currency={currency} trend="up" />
        <MetricCard title="Income" value={snapshot.totalIncomeBase} currency={currency} trend="up" />
        <MetricCard title="Expense" value={snapshot.totalExpenseBase} currency={currency} trend="down" />
        <MetricCard title="Savings rate" value={snapshot.savingsRate} currency={currency} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Wallets</h2>
                <p className="text-sm text-muted-foreground">
                  {snapshot.walletCount} wallet{snapshot.walletCount === 1 ? "" : "s"} connected
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/wallets">View all</Link>
              </Button>
            </div>
            {snapshot.quickWallets.length ? (
              <div className="grid gap-3 md:grid-cols-3">
                {snapshot.quickWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-sm text-muted-foreground">{wallet.name}</p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatCurrency(wallet.balance, wallet.nativeCurrency)}
                    </p>
                  </div>
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
            <div>
              <h2 className="text-lg font-semibold">Budget health</h2>
              <p className="text-sm text-muted-foreground">
                Current monthly spending posture
              </p>
            </div>
            {snapshot.budgetHealth ? (
              <div className="space-y-2">
                <p className="text-3xl font-semibold">
                  {formatCompactCurrency(snapshot.budgetHealth.spent, currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {formatCompactCurrency(snapshot.budgetHealth.limit, currency)} this month
                </p>
              </div>
            ) : (
              <EmptyState
                title="No active budget"
                description="Set a monthly budget to see health states, warning thresholds, and category control."
                action={
                  <Button asChild>
                    <Link href="/budgets">Open budgets</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent transactions</h2>
              <Button asChild variant="ghost">
                <Link href="/transactions">History</Link>
              </Button>
            </div>
            {snapshot.recentTransactions.length ? (
              <div className="space-y-3">
                {snapshot.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{transaction.category ?? "Uncategorized"}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.notes ?? "No notes"}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount, transaction.nativeCurrency)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No transactions yet"
                description="Income, expenses, and transfers will appear here once you begin recording activity."
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Goals and alerts</h2>
              <Button asChild variant="ghost">
                <Link href="/goals">Open goals</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {snapshot.activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="font-medium">{goal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(goal.savedAmount, currency)} saved of{" "}
                    {formatCurrency(goal.targetAmount, currency)}
                  </p>
                </div>
              ))}
              {snapshot.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.description ?? "Reminder ready"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
