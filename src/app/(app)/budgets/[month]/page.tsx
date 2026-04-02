import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatMonthLabel } from "@/domain/finance";
import { getCurrentUserProfile, getBudgetOverview } from "@/data/finance-repository";

export default async function BudgetMonthDetailPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const [profile, snapshot] = await Promise.all([
    getCurrentUserProfile(),
    getBudgetOverview(),
  ]);

  if (!snapshot.currentBudget || snapshot.currentBudget.month !== month) {
    notFound();
  }

  const currency = profile?.baseCurrency ?? "GHS";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budget detail"
        title={formatMonthLabel(month)}
        description="Review actual spending against category limits and spot budget pressure early."
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
