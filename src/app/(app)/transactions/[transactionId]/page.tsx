import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import {
  formatCurrency,
  formatMonthLabel,
  getTransactionDisplayLabel,
} from "@/domain/finance";
import { getBudgetOverview, getTransactions } from "@/data/finance-repository";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Transaction", "View transaction details.");

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  const [transactions, budgetOverview] = await Promise.all([
    getTransactions(),
    getBudgetOverview(),
  ]);
  const transaction = transactions.find((item) => item.id === transactionId);

  if (!transaction) {
    notFound();
  }

  const transactionMonth = transaction.occurredAt.slice(0, 7);
  const countsTowardActiveBudget =
    transaction.displayType === "expense" &&
    Boolean(transaction.categoryId) &&
    budgetOverview.currentBudget?.month === transactionMonth;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction"
        description="View amount, notes, and status."
      />
      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{getTransactionDisplayLabel(transaction)}</Badge>
            {countsTowardActiveBudget ? (
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                Counts toward {formatMonthLabel(transactionMonth)} budget
              </Badge>
            ) : null}
          </div>
          <p className="text-3xl font-semibold">
            {formatCurrency(transaction.amount, transaction.nativeCurrency)}
          </p>
          <p className="text-sm text-muted-foreground">{transaction.notes ?? "No notes"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
