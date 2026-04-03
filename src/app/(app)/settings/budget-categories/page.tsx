import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { getBudgetCategories } from "@/data/finance-repository";
import { BudgetCategoryCard } from "@/features/settings/budget-category-card";

export default async function BudgetCategoriesPage() {
  const categories = await getBudgetCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Budget categories"
        description="Manage the categories used when creating monthly budgets."
        action={
          <HeaderActionLink href="/settings/budget-categories/new" icon={Plus}>
            Add category
          </HeaderActionLink>
        }
      />
      {categories.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {categories.map((category) => (
            <BudgetCategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No budget categories yet"
          description="Add categories here before creating a monthly budget."
          action={
            <Button asChild>
              <Link href="/settings/budget-categories/new">Add category</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
