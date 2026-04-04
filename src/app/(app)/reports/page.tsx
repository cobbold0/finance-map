import { DistributionChart, TrendChart } from "@/components/app/charts";
import { MetricCard } from "@/components/app/metric-card";
import { PageHeader } from "@/components/app/page-header";
import { getCurrentUserProfile, getReportsSnapshot } from "@/data/finance-repository";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Reports", "Review your reports.");

export default async function ReportsPage() {
  const [profile, reports] = await Promise.all([
    getCurrentUserProfile(),
    getReportsSnapshot(),
  ]);
  const currency = profile?.baseCurrency ?? "GHS";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review trends, totals, and spending."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Income" value={reports.summary.income} currency={currency} trend="up" />
        <MetricCard title="Expense" value={reports.summary.expense} currency={currency} trend="down" />
        <MetricCard title="Net" value={reports.summary.net} currency={currency} trend={reports.summary.net >= 0 ? "up" : "down"} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <TrendChart title="Income vs expense trend" data={reports.trends} />
        <DistributionChart title="Expense distribution" data={reports.expenseDistribution} />
      </section>
    </div>
  );
}
