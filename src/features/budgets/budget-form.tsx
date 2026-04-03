"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { saveBudgetAction } from "@/features/budgets/actions";
import { budgetSchema } from "@/features/budgets/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BudgetValues = import("zod").input<typeof budgetSchema>;

export function BudgetForm({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<BudgetValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: new Date().toISOString().slice(0, 7),
      totalLimit: null,
      items: categories.map((category) => ({
        categoryId: category.id,
        categoryName: category.name,
        limitAmount: 0,
      })),
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveBudgetAction(values);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Budget created.");
          router.push(`/budgets/${result.month}`);
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Month</Label>
          <Input type="month" {...form.register("month")} />
        </div>
        <div>
          <Label>Total limit</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="Optional"
            {...form.register("totalLimit", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Leave empty to use the sum of your category limits.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Category limits</h2>
          <p className="text-sm text-muted-foreground">
            Set limits only for the categories you want to track this month.
          </p>
        </div>
        <div className="grid gap-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[1fr_180px]"
            >
              <input type="hidden" {...form.register(`items.${index}.categoryId`)} />
              <input type="hidden" {...form.register(`items.${index}.categoryName`)} />
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-muted-foreground">
                  Leave at zero to exclude this category from the month.
                </p>
              </div>
              <div>
                <Label className="sr-only">Limit for {category.name}</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register(`items.${index}.limitAmount`, {
                    setValueAs: (value) => (value === "" ? 0 : Number(value)),
                  })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create budget"}
      </Button>
    </form>
  );
}
