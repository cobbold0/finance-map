"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { walletSchema } from "@/features/wallets/schemas";

export async function saveWalletAction(values: unknown, walletId?: string) {
  const payload = walletSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid wallet." };
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
    description: payload.data.description ?? null,
    currency: payload.data.nativeCurrency,
    icon: payload.data.icon,
    color: payload.data.color,
  };

  const query = walletId
    ? supabase.from("wallets").update(record).eq("id", walletId).eq("user_id", user.id)
    : supabase.from("wallets").insert(record);

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/wallets");
  revalidatePath("/");
  return { success: true };
}
