"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { saveBudgetCategoryAction } from "@/features/settings/actions";
import { budgetCategorySchema } from "@/features/settings/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BudgetCategoryValues = z.infer<typeof budgetCategorySchema>;

export function BudgetCategoryForm({
  categoryId,
  defaultValues,
}: {
  categoryId?: string;
  defaultValues?: Partial<BudgetCategoryValues>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<BudgetCategoryValues>({
    resolver: zodResolver(budgetCategorySchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      color: defaultValues?.color ?? "",
      icon: defaultValues?.icon ?? "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveBudgetCategoryAction(values, categoryId);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success(
            categoryId ? "Budget category updated." : "Budget category added.",
          );
          router.push("/settings/budget-categories");
          router.refresh();
        }),
      )}
    >
      <div>
        <Label>Name</Label>
        <Input {...form.register("name")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Color</Label>
          <Input {...form.register("color")} placeholder="#3B82F6" />
        </div>
        <div>
          <Label>Icon</Label>
          <Input {...form.register("icon")} placeholder="wallet" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving..."
          : categoryId
            ? "Update category"
            : "Save category"}
      </Button>
    </form>
  );
}
