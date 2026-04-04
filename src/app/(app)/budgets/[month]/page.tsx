import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatMonthLabel } from "@/domain/finance";
import { getCurrentUserProfile, getBudgetOverview } from "@/data/finance-repository";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Budget", "View budget details.");

export default async function BudgetMonthDetailPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const [profile, snapshot] = await Promise.all([
    getCurrentUserProfile(),
    getBudgetOverview(month),
  ]);

  if (!snapshot.currentBudget || snapshot.currentBudget.month !== month) {
    notFound();
  }

  const currency = profile?.baseCurrency ?? "GHS";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        description={`Review the budget for ${formatMonthLabel(month)}.`}
      />
      <div className="grid gap-4">
        {snapshot.categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{category.categoryName}</p>
                <p className="text-sm text-muted-foreground">
                  Remaining {formatCurrency(category.remainingAmount, currency)}
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
  );
}
