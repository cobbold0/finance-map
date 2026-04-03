"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { saveBankAccountAction } from "@/features/settings/actions";
import { bankAccountSchema } from "@/features/settings/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BankAccountValues = z.infer<typeof bankAccountSchema>;

export function BankAccountForm({
  bankAccountId,
  defaultValues,
}: {
  bankAccountId?: string;
  defaultValues?: Partial<BankAccountValues>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<BankAccountValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      label: defaultValues?.label ?? "",
      accountName: defaultValues?.accountName ?? "",
      accountNumber: defaultValues?.accountNumber ?? "",
      bankName: defaultValues?.bankName ?? "",
      branch: defaultValues?.branch ?? "",
      swiftCode: defaultValues?.swiftCode ?? "",
      mobileMoneyProvider: defaultValues?.mobileMoneyProvider ?? "",
      mobileMoneyNumber: defaultValues?.mobileMoneyNumber ?? "",
      notes: defaultValues?.notes ?? "",
      isPrimary: defaultValues?.isPrimary ?? false,
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveBankAccountAction(values, bankAccountId);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success(bankAccountId ? "Bank details updated." : "Bank details saved.");
          router.push("/settings/bank-accounts");
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Label</Label>
          <Input {...form.register("label")} />
        </div>
        <div>
          <Label>Bank name</Label>
          <Input {...form.register("bankName")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Account name</Label>
          <Input {...form.register("accountName")} />
        </div>
        <div>
          <Label>Account number</Label>
          <Input {...form.register("accountNumber")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Branch</Label>
          <Input {...form.register("branch")} />
        </div>
        <div>
          <Label>Swift code</Label>
          <Input {...form.register("swiftCode")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Mobile money provider</Label>
          <Input {...form.register("mobileMoneyProvider")} />
        </div>
        <div>
          <Label>Mobile money number</Label>
          <Input {...form.register("mobileMoneyNumber")} />
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea {...form.register("notes")} />
      </div>
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
        <input type="checkbox" className="h-4 w-4" {...form.register("isPrimary")} />
        Set as primary payout/account detail
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : bankAccountId ? "Update bank details" : "Save bank details"}
      </Button>
    </form>
  );
}
