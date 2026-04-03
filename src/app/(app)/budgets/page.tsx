import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import { formatMonthLabel, formatCurrency } from "@/domain/finance";
import { getCurrentUserProfile, getBudgetOverview } from "@/data/finance-repository";

export default async function BudgetsPage() {
  const [profile, snapshot] = await Promise.all([
    getCurrentUserProfile(),
    getBudgetOverview(),
  ]);
  const currency = profile?.baseCurrency ?? "GHS";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budgets"
        title="Budget with clarity"
        description="See monthly limits, category pressure, and warning states before spending slips."
        action={
          snapshot.currentBudget ? (
            <HeaderActionLink
              href={`/budgets/${snapshot.currentBudget.month}`}
              icon={ArrowUpRight}
            >
              Open month
            </HeaderActionLink>
          ) : undefined
        }
      />
      {snapshot.currentBudget ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {formatMonthLabel(snapshot.currentBudget.month)}
              </p>
              <p className="text-3xl font-semibold">
                {formatCurrency(snapshot.currentBudget.totalLimit ?? 0, currency)}
              </p>
            </CardContent>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            {snapshot.categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{category.categoryName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(category.spentAmount, currency)} /{" "}
                      {formatCurrency(category.limitAmount, currency)}
                    </p>
                  </div>
                  <Progress
                    value={
                      category.limitAmount > 0
                        ? (category.spentAmount / category.limitAmount) * 100
                        : 0
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No monthly budget yet"
          description="Create a monthly budget to track category limits, spending progress, and warning states."
        />
      )}
    </div>
  );
}
