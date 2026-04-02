"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/features/transactions/schemas";

export async function saveTransactionAction(values: unknown, transactionId?: string) {
  const payload = transactionSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid transaction." };
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

  const { walletId, destinationWalletId, type, amount } = payload.data;

  const record = {
    user_id: user.id,
    wallet_id: walletId,
    destination_wallet_id: destinationWalletId || null,
    type,
    amount,
    category: payload.data.category || null,
    description: payload.data.notes || null,
    date: payload.data.occurredAt,
  };

  const query = transactionId
    ? supabase
        .from("transactions")
        .update(record)
        .eq("id", transactionId)
        .eq("user_id", user.id)
    : supabase.from("transactions").insert(record);

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  if (!transactionId) {
    const sign =
      type === "expense" ? -1 : type === "transfer" ? -1 : 1;

    await supabase.rpc("increment_wallet_balance", {
      wallet_id_input: walletId,
      amount_input: amount * sign,
    });

    if (type === "transfer" && destinationWalletId) {
      await supabase.rpc("increment_wallet_balance", {
        wallet_id_input: destinationWalletId,
        amount_input: amount,
      });
    }
  }

  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/wallets");
  return { success: true };
}
