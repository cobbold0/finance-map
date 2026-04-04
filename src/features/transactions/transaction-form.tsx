"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Wallet } from "@/domain/models";
import { saveTransactionAction } from "@/features/transactions/actions";
import {
  transactionDisplayTypeSchema,
  transactionSchema,
} from "@/features/transactions/schemas";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TransactionValues = z.infer<typeof transactionSchema>;

function readDisplayType(value: string | null | undefined): TransactionValues["displayType"] {
  const parsed = transactionDisplayTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : "expense";
}

function getLocalDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function TransactionForm({
  wallets,
  budgetCategories,
  activeBudgetMonth,
  transactionId,
  defaultValues,
}: {
  wallets: Wallet[];
  budgetCategories: Array<{ id: string; name: string }>;
  activeBudgetMonth?: string | null;
  transactionId?: string;
  defaultValues?: Partial<TransactionValues>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const form = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      walletId:
        defaultValues?.walletId ??
        searchParams.get("walletId") ??
        wallets[0]?.id ??
        "",
      destinationWalletId: defaultValues?.destinationWalletId ?? "",
      displayType:
        defaultValues?.displayType ??
        readDisplayType(searchParams.get("type")) ??
        "expense",
      amount: defaultValues?.amount ?? 0,
      categoryId: defaultValues?.categoryId ?? "",
      notes: defaultValues?.notes ?? "",
      occurredAt:
        defaultValues?.occurredAt ?? getLocalDateTimeValue(),
    },
  });

  const displayType = useWatch({ control: form.control, name: "displayType" });
  const isExpense = displayType === "expense";
  const isTransfer = displayType === "transfer";
  const isWithdrawal = displayType === "withdrawal";
  const showsCategory = isExpense;
  const occurredAt = useWatch({ control: form.control, name: "occurredAt" });
  const selectedMonth = occurredAt?.slice(0, 7);
  const outsideActiveBudgetMonth =
    isExpense &&
    Boolean(activeBudgetMonth) &&
    Boolean(selectedMonth) &&
    selectedMonth !== activeBudgetMonth;

  useEffect(() => {
    if (!isTransfer) {
      form.setValue("destinationWalletId", "", { shouldValidate: false });
    }

    if (!isExpense) {
      form.setValue("categoryId", "", { shouldValidate: false });
    }
  }, [form, isExpense, isTransfer]);

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
          <Label htmlFor="transaction-type">Type</Label>
          <Select id="transaction-type" {...form.register("displayType")}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="salary">Salary</option>
            <option value="bonus">Bonus</option>
            <option value="adjustment">Adjustment</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="transaction-amount">Amount</Label>
          <Input
            id="transaction-amount"
            type="number"
            step="0.01"
            {...form.register("amount", { valueAsNumber: true })}
          />
          <FormError message={form.formState.errors.amount?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="transaction-wallet">Wallet</Label>
          <Select id="transaction-wallet" {...form.register("walletId")}>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </Select>
          <FormError message={form.formState.errors.walletId?.message} />
        </div>
        {isTransfer ? (
          <div>
            <Label htmlFor="transaction-destination-wallet">Destination wallet</Label>
            <Select
              id="transaction-destination-wallet"
              {...form.register("destinationWalletId")}
            >
              <option value="">Select destination</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </Select>
            <FormError message={form.formState.errors.destinationWalletId?.message} />
          </div>
        ) : null}
      </div>

      {showsCategory ? (
        budgetCategories.length ? (
          <div>
            <Label htmlFor="transaction-category">Budget category</Label>
            <Select id="transaction-category" {...form.register("categoryId")}>
              <option value="">Choose category</option>
              {budgetCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <p className="mt-2 text-sm text-muted-foreground">
              Counts toward this month&apos;s budget when the category is budget-tracked.
            </p>
            {activeBudgetMonth ? (
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Active budget month: {activeBudgetMonth}
              </p>
            ) : null}
            <FormError message={form.formState.errors.categoryId?.message} />
          </div>
        ) : (
          <EmptyState
            title="Add a budget category before recording an expense"
            description="Expenses are now budget-aware, so they need a category from your budget setup."
            action={
              <Button asChild>
                <Link href="/settings/budget-categories">Manage budget categories</Link>
              </Button>
            }
          />
        )
      ) : null}

      {isWithdrawal ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
          Moves money out of tracked wallets without assigning it to a budget.
        </p>
      ) : null}

      {outsideActiveBudgetMonth ? (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          This expense is dated for {selectedMonth}, so it will not count toward your active{" "}
          {activeBudgetMonth} budget.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="transaction-date">Date</Label>
          <Input id="transaction-date" type="datetime-local" {...form.register("occurredAt")} />
          <FormError message={form.formState.errors.occurredAt?.message} />
        </div>
        <div>
          <Label htmlFor="transaction-notes">Notes</Label>
          <Textarea id="transaction-notes" {...form.register("notes")} />
        </div>
      </div>

      <Button type="submit" disabled={pending || (isExpense && budgetCategories.length === 0)}>
        {pending ? "Saving..." : transactionId ? "Update transaction" : "Save transaction"}
      </Button>
    </form>
  );
}
