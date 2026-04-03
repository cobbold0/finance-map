import { PageHeader } from "@/components/app/page-header";
import { BudgetCategoryForm } from "@/features/settings/budget-category-form";

export default function NewBudgetCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Add budget category"
        description="Create a category to use in monthly budget planning."
      />
      <BudgetCategoryForm />
    </div>
  );
}
