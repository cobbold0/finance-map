import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getBudgetCategory } from "@/data/finance-repository";
import { BudgetCategoryForm } from "@/features/settings/budget-category-form";

export default async function EditBudgetCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const category = await getBudgetCategory(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Edit budget category"
        description="Update the category used in monthly budget planning."
      />
      <BudgetCategoryForm
        categoryId={categoryId}
        defaultValues={{
          name: category.name,
          color: category.color ?? "",
          icon: category.icon ?? "",
        }}
      />
    </div>
  );
}
