import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getTransactions, getWallets } from "@/data/finance-repository";
import { TransactionForm } from "@/features/transactions/transaction-form";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  const [wallets, transactions] = await Promise.all([getWallets(), getTransactions()]);
  const transaction = transactions.find((item) => item.id === transactionId);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Transactions" title="Edit transaction" description="Adjust amount, wallet, category, and notes without losing the audit trail." />
      <TransactionForm
        wallets={wallets}
        transactionId={transactionId}
        defaultValues={{
          walletId: transaction.walletId,
          destinationWalletId: transaction.destinationWalletId ?? "",
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category ?? "",
          notes: transaction.notes ?? "",
          occurredAt: transaction.occurredAt.slice(0, 16),
        }}
      />
    </div>
  );
}
