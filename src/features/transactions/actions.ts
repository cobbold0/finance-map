"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  transactionDisplayTypeSchema,
  transactionSchema,
} from "@/features/transactions/schemas";
import { TransactionType } from "@/domain/models";
import { z } from "zod";

function mapDisplayTypeToPersistence(
  displayType: z.infer<typeof transactionDisplayTypeSchema>,
): { type: TransactionType; destinationWalletId?: string | null } {
  switch (displayType) {
    case "withdrawal":
      return {
        type: "transfer",
        destinationWalletId: null,
      };
    case "income":
    case "expense":
    case "transfer":
    case "salary":
    case "bonus":
    case "adjustment":
      return {
        type: displayType,
        destinationWalletId: undefined,
      };
  }
}

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

  const { walletId, amount, categoryId, notes, occurredAt, destinationWalletId, displayType } =
    payload.data;
  const mapped = mapDisplayTypeToPersistence(displayType);
  const persistedType = mapped.type;
  const persistedDestinationWalletId =
    mapped.destinationWalletId !== undefined
      ? mapped.destinationWalletId
      : destinationWalletId?.trim() || null;
  let categoryRecord: { id: string; name: string } | null = null;

  if (displayType === "expense") {
    const { data: categoryRows } = await supabase
      .from("budget_categories")
      .select("id, name")
      .eq("user_id", user.id);

    const categoryMap = new Map((categoryRows ?? []).map((row) => [row.id, row]));

    if (!categoryMap.size) {
      return { error: "Add a budget category before recording an expense." };
    }

    categoryRecord = categoryMap.get(categoryId?.trim() ?? "") ?? null;

    if (!categoryRecord) {
      return { error: "Choose a valid budget category for this expense." };
    }
  }

  const record = {
    transaction_id_input: transactionId ?? null,
    wallet_id_input: walletId,
    destination_wallet_id_input: persistedDestinationWalletId,
    transaction_type_input: persistedType,
    amount_input: amount,
    category_id_input: displayType === "expense" ? categoryRecord?.id ?? null : null,
    description_input: notes?.trim() || null,
    occurred_at_input: occurredAt,
  };

  const { error } = await supabase.rpc(
    "save_transaction_with_wallet_impacts",
    record,
  );

  if (error) {
    if (transactionId && error.message === "Transaction not found") {
      return { error: "We couldn't find that transaction to update." };
    }

    return { error: error.message };
  }

  const month = occurredAt.slice(0, 7);

  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/wallets");
  revalidatePath("/budgets");
  revalidatePath(`/budgets/${month}`);

  return { success: true };
}
