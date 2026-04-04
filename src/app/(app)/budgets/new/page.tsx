import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { getBudgetCategories } from "@/data/finance-repository";
import { BudgetForm } from "@/features/budgets/budget-form";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Add Budget", "Create a budget.");

export default async function NewBudgetPage() {
  const categories = await getBudgetCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Budget"
        description="Create a new budget."
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
