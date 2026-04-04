import { PageHeader } from "@/components/app/page-header";
import { BudgetCategoryForm } from "@/features/settings/budget-category-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Add Budget Category", "Create a budget category.");

export default function NewBudgetCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Budget Category"
        description="Create a new budget category."
      />
      <BudgetCategoryForm />
    </div>
  );
}
