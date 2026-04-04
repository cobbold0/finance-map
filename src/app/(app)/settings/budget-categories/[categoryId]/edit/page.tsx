import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getBudgetCategory } from "@/data/finance-repository";
import { BudgetCategoryForm } from "@/features/settings/budget-category-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Edit Budget Category", "Update this budget category.");

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
        title="Edit Budget Category"
        description="Update budget category details."
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
