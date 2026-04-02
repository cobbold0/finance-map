import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { formatCurrency } from "@/domain/finance";
import { getTransactions } from "@/data/finance-repository";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  const transactions = await getTransactions();
  const transaction = transactions.find((item) => item.id === transactionId);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Transactions" title={transaction.category ?? "Transaction detail"} description="Reference, notes, amount, and reconciliation context." />
      <Card>
        <CardContent className="space-y-3">
          <p className="text-3xl font-semibold">
            {formatCurrency(transaction.amount, transaction.nativeCurrency)}
          </p>
          <p className="text-sm text-muted-foreground">{transaction.notes ?? "No notes"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
