import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  getBudgetCategories,
  getBudgetOverview,
  getWallets,
} from "@/data/finance-repository";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Add Transaction", "Create a transaction.");

export default async function NewTransactionPage() {
  const [wallets, budgetCategories, budgetOverview] = await Promise.all([
    getWallets(),
    getBudgetCategories(),
    getBudgetOverview(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Add Transaction" description="Create a new transaction." />
      {wallets.length ? (
        <TransactionForm
          wallets={wallets}
          budgetCategories={budgetCategories}
          activeBudgetMonth={budgetOverview.currentBudget?.month ?? null}
        />
      ) : (
        <EmptyState
          title="You need a wallet first"
          description="Create a wallet before recording money movement."
          action={
            <Button asChild>
              <Link href="/wallets/new">Create wallet</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
