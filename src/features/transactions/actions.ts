"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  transactionDisplayTypeSchema,
  transactionSchema,
} from "@/features/transactions/schemas";
import { TransactionType } from "@/domain/models";
import { z } from "zod";

type PersistedTransactionInput = {
  walletId: string;
  destinationWalletId: string | null;
  type: TransactionType;
  amount: number;
};

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

async function applyWalletImpact(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  transaction: PersistedTransactionInput,
  multiplier: 1 | -1,
) {
  const outgoingAmount =
    transaction.type === "expense" || transaction.type === "transfer"
      ? transaction.amount * -1 * multiplier
      : transaction.amount * multiplier;

  await supabase.rpc("increment_wallet_balance", {
    wallet_id_input: transaction.walletId,
    amount_input: outgoingAmount,
  });

  if (transaction.type === "transfer" && transaction.destinationWalletId) {
    await supabase.rpc("increment_wallet_balance", {
      wallet_id_input: transaction.destinationWalletId,
      amount_input: transaction.amount * multiplier,
    });
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
    user_id: user.id,
    wallet_id: walletId,
    destination_wallet_id: persistedDestinationWalletId,
    type: persistedType,
    amount,
    category_id: displayType === "expense" ? categoryRecord?.id ?? null : null,
    category: displayType === "expense" ? categoryRecord?.name ?? null : null,
    description: notes?.trim() || null,
    date: occurredAt,
  };

  if (transactionId) {
    const { data: existingTransaction, error: existingError } = await supabase
      .from("transactions")
      .select("wallet_id, destination_wallet_id, type, amount")
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError || !existingTransaction) {
      return { error: "We couldn't find that transaction to update." };
    }

    await applyWalletImpact(
      supabase,
      {
        walletId: existingTransaction.wallet_id,
        destinationWalletId: existingTransaction.destination_wallet_id ?? null,
        type: existingTransaction.type,
        amount: Number(existingTransaction.amount),
      },
      -1,
    );

    const { error } = await supabase
      .from("transactions")
      .update(record)
      .eq("id", transactionId)
      .eq("user_id", user.id);

    if (error) {
      await applyWalletImpact(
        supabase,
        {
          walletId: existingTransaction.wallet_id,
          destinationWalletId: existingTransaction.destination_wallet_id ?? null,
          type: existingTransaction.type,
          amount: Number(existingTransaction.amount),
        },
        1,
      );
      return { error: error.message };
    }

    await applyWalletImpact(
      supabase,
      {
        walletId,
        destinationWalletId: persistedDestinationWalletId,
        type: persistedType,
        amount,
      },
      1,
    );
  } else {
    const { error } = await supabase.from("transactions").insert(record);

    if (error) {
      return { error: error.message };
    }

    await applyWalletImpact(
      supabase,
      {
        walletId,
        destinationWalletId: persistedDestinationWalletId,
        type: persistedType,
        amount,
      },
      1,
    );
  }

  const month = occurredAt.slice(0, 7);

  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/wallets");
  revalidatePath("/budgets");
  revalidatePath(`/budgets/${month}`);

  return { success: true };
}
