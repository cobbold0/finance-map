import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import {
  getBudgetCategories,
  getBudgetOverview,
  getTransactions,
  getWallets,
} from "@/data/finance-repository";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Edit Transaction", "Update this transaction.");

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  const [wallets, budgetCategories, budgetOverview, transactions] = await Promise.all([
    getWallets(),
    getBudgetCategories(),
    getBudgetOverview(),
    getTransactions(),
  ]);
  const transaction = transactions.find((item) => item.id === transactionId);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Transaction" description="Update transaction details." />
      <TransactionForm
        wallets={wallets}
        budgetCategories={budgetCategories}
        activeBudgetMonth={budgetOverview.currentBudget?.month ?? null}
        transactionId={transactionId}
        defaultValues={{
          walletId: transaction.walletId,
          destinationWalletId: transaction.destinationWalletId ?? "",
          displayType: transaction.displayType,
          amount: transaction.amount,
          categoryId: transaction.categoryId ?? budgetCategories.find((category) => category.name === transaction.category)?.id ?? "",
          notes: transaction.notes ?? "",
          occurredAt: transaction.occurredAt.slice(0, 16),
        }}
      />
    </div>
  );
}
