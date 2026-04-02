"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { goalSchema } from "@/features/goals/schemas";

export async function saveGoalAction(values: unknown, goalId?: string) {
  const payload = goalSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid goal." };
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

  const record = {
    user_id: user.id,
    name: payload.data.name,
    description: payload.data.description || null,
    target_amount: payload.data.targetAmount,
    current_amount: payload.data.savedAmount,
    target_date: payload.data.targetDate || null,
    priority: payload.data.priority,
    goal_type: payload.data.type,
    linked_wallet_id: payload.data.walletId || null,
  };

  const query = goalId
    ? supabase.from("goals").update(record).eq("id", goalId).eq("user_id", user.id)
    : supabase.from("goals").insert(record);

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}
