"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { budgetSchema } from "@/features/budgets/schemas";

export async function saveBudgetAction(values: unknown) {
  const payload = budgetSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid budget." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  const selectedItems = payload.data.items.filter((item) => item.limitAmount > 0);
  const computedTotal = selectedItems.reduce(
    (total, item) => total + item.limitAmount,
    0,
  );
  const totalLimit =
    payload.data.totalLimit && payload.data.totalLimit > 0
      ? payload.data.totalLimit
      : computedTotal;

  const { data: budgetRecord, error: budgetError } = await supabase.rpc(
    "create_budget_with_items",
    {
      month_input: payload.data.month,
      total_limit_input: totalLimit || null,
      items_input: selectedItems.map((item) => ({
        category_id: item.categoryId,
        limit_amount: item.limitAmount,
      })),
    },
  );

  if (budgetError) {
    if (budgetError.code === "23505") {
      return { error: "A budget already exists for that month." };
    }

    return { error: budgetError.message };
  }

  revalidatePath("/budgets");
  revalidatePath(`/budgets/${budgetRecord?.[0]?.budget_month ?? payload.data.month}`);
  revalidatePath("/");

  return { success: true, month: budgetRecord?.[0]?.budget_month ?? payload.data.month };
}

export async function createStarterBudgetCategoriesAction() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/budgets/new");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/welcome");
  }

  const starterCategories = [
    { name: "Housing", color: "#3B82F6", icon: "home" },
    { name: "Food", color: "#10B981", icon: "utensils" },
    { name: "Transport", color: "#F59E0B", icon: "car" },
    { name: "Utilities", color: "#8B5CF6", icon: "bolt" },
    { name: "Savings", color: "#06B6D4", icon: "piggy-bank" },
    { name: "Health", color: "#EF4444", icon: "heart" },
    { name: "Entertainment", color: "#EC4899", icon: "film" },
    { name: "Education", color: "#6366F1", icon: "book-open" },
  ];

  const { data: existing } = await supabase
    .from("budget_categories")
    .select("name")
    .eq("user_id", user.id);

  const existingNames = new Set((existing ?? []).map((item) => item.name));
  const rowsToInsert = starterCategories
    .filter((category) => !existingNames.has(category.name))
    .map((category) => ({
      user_id: user.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
    }));

  if (rowsToInsert.length) {
    const { error } = await supabase.from("budget_categories").insert(rowsToInsert);

    if (error) {
      redirect("/budgets/new");
    }
  }

  revalidatePath("/budgets/new");
  revalidatePath("/budgets");
  redirect("/budgets/new");
}
