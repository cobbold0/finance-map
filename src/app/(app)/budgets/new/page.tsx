import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { getBudgetCategories } from "@/data/finance-repository";
import { BudgetForm } from "@/features/budgets/budget-form";
import Link from "next/link";

export default async function NewBudgetPage() {
  const categories = await getBudgetCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budgets"
        title="Create budget"
        description="Set your monthly limit and category caps for the month ahead."
      />
      {categories.length ? (
        <BudgetForm categories={categories} />
      ) : (
        <EmptyState
          title="No budget categories yet"
          description="Add budget categories first so you can assign limits to the month."
          action={
            <Button asChild>
              <Link href="/settings/budget-categories">Manage budget categories</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
