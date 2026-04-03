"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteBudgetCategoryAction } from "@/features/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BudgetCategoryCard({
  category,
}: {
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  };
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full border border-white/10"
                style={{ backgroundColor: category.color ?? "#3B82F6" }}
                aria-hidden="true"
              />
              <p className="text-lg font-semibold">{category.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Icon: {category.icon ?? "not set"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/settings/budget-categories/${category.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteBudgetCategoryAction(category.id);

                  if (result?.error) {
                    toast.error(result.error);
                    return;
                  }

                  toast.success("Budget category deleted.");
                })
              }
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
