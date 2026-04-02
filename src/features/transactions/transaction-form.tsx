"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Wallet } from "@/domain/models";
import { saveTransactionAction } from "@/features/transactions/actions";
import { transactionSchema } from "@/features/transactions/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TransactionValues = z.infer<typeof transactionSchema>;

export function TransactionForm({
  wallets,
  transactionId,
  defaultValues,
}: {
  wallets: Wallet[];
  transactionId?: string;
  defaultValues?: Partial<TransactionValues>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const form = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      walletId: defaultValues?.walletId ?? wallets[0]?.id ?? "",
      destinationWalletId: defaultValues?.destinationWalletId ?? "",
      type:
        defaultValues?.type ??
        (searchParams.get("type") as TransactionValues["type"]) ??
        "expense",
      amount: defaultValues?.amount ?? 0,
      category: defaultValues?.category ?? "",
      notes: defaultValues?.notes ?? "",
      occurredAt:
        defaultValues?.occurredAt ?? new Date().toISOString().slice(0, 16),
    },
  });

  const type = useWatch({ control: form.control, name: "type" });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveTransactionAction(values, transactionId);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success(transactionId ? "Transaction updated." : "Transaction saved.");
          router.push("/transactions");
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Type</Label>
          <Select {...form.register("type")}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
            <option value="salary">Salary</option>
            <option value="bonus">Bonus</option>
            <option value="adjustment">Adjustment</option>
          </Select>
        </div>
        <div>
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register("amount", { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Wallet</Label>
          <Select {...form.register("walletId")}>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </Select>
        </div>
        {type === "transfer" ? (
          <div>
            <Label>Destination wallet</Label>
            <Select {...form.register("destinationWalletId")}>
              <option value="">Select destination</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Category</Label>
          <Input {...form.register("category")} />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="datetime-local" {...form.register("occurredAt")} />
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea {...form.register("notes")} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : transactionId ? "Update transaction" : "Save transaction"}
      </Button>
    </form>
  );
}
