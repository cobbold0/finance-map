import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { getBudgetCategories } from "@/data/finance-repository";
import { createStarterBudgetCategoriesAction } from "@/features/budgets/actions";
import { BudgetForm } from "@/features/budgets/budget-form";

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
          description="Create starter categories first so you can assign limits to the month."
          action={
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <form action={createStarterBudgetCategoriesAction}>
                <Button type="submit">Create starter categories</Button>
              </form>
              <Button asChild variant="outline">
                <Link href="/settings">Back to settings</Link>
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}
