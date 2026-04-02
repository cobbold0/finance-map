import { DistributionChart, TrendChart } from "@/components/app/charts";
import { MetricCard } from "@/components/app/metric-card";
import { PageHeader } from "@/components/app/page-header";
import { getCurrentUserProfile, getReportsSnapshot } from "@/data/finance-repository";

export default async function ReportsPage() {
  const [profile, reports] = await Promise.all([
    getCurrentUserProfile(),
    getReportsSnapshot(),
  ]);
  const currency = profile?.baseCurrency ?? "GHS";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Readable financial reporting"
        description="Monthly trend lines, expense distribution, wallet performance, and savings indicators without clutter."
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
