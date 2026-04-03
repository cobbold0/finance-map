"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { saveFinancialRecordAction } from "@/features/settings/actions";
import { financialRecordSchema } from "@/features/settings/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FinancialRecordValues = z.infer<typeof financialRecordSchema>;

export function FinancialRecordForm({
  recordId,
  defaultValues,
}: {
  recordId?: string;
  defaultValues?: Partial<FinancialRecordValues>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FinancialRecordValues>({
    resolver: zodResolver(financialRecordSchema),
    defaultValues: {
      type: defaultValues?.type ?? "investment",
      label: defaultValues?.label ?? "",
      providerName: defaultValues?.providerName ?? "",
      productName: defaultValues?.productName ?? "",
      referenceNumber: defaultValues?.referenceNumber ?? "",
      currency: defaultValues?.currency ?? "GHS",
      monthlyContribution: defaultValues?.monthlyContribution ?? null,
      currentValue: defaultValues?.currentValue ?? null,
      coverageAmount: defaultValues?.coverageAmount ?? null,
      startDate: defaultValues?.startDate ?? "",
      maturityDate: defaultValues?.maturityDate ?? "",
      contactPerson: defaultValues?.contactPerson ?? "",
      contactPhone: defaultValues?.contactPhone ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveFinancialRecordAction(values, recordId);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success(
            recordId ? "Financial record updated." : "Financial record saved.",
          );
          router.push("/settings/financial-records");
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Type</Label>
          <Select {...form.register("type")}>
            <option value="pension_tier_1">Pension tier 1</option>
            <option value="pension_tier_2">Pension tier 2</option>
            <option value="pension_tier_3">Pension tier 3</option>
            <option value="investment">Investment</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div>
          <Label>Label</Label>
          <Input {...form.register("label")} placeholder="Tier 2 pension" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Company / provider</Label>
          <Input {...form.register("providerName")} placeholder="Enterprise Trustees" />
        </div>
        <div>
          <Label>Product / plan name</Label>
          <Input {...form.register("productName")} placeholder="Retirement plan" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Reference / policy number</Label>
          <Input {...form.register("referenceNumber")} />
        </div>
        <div>
          <Label>Currency</Label>
          <Select {...form.register("currency")}>
            <option value="GHS">GHS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="KES">KES</option>
            <option value="NGN">NGN</option>
            <option value="ZAR">ZAR</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Monthly contribution</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register("monthlyContribution", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />
        </div>
        <div>
          <Label>Current value</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register("currentValue", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />
        </div>
        <div>
          <Label>Coverage amount</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register("coverageAmount", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Start date</Label>
          <Input type="date" {...form.register("startDate")} />
        </div>
        <div>
          <Label>Maturity / renewal date</Label>
          <Input type="date" {...form.register("maturityDate")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Contact person</Label>
          <Input {...form.register("contactPerson")} />
        </div>
        <div>
          <Label>Contact phone</Label>
          <Input {...form.register("contactPhone")} />
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea {...form.register("notes")} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving..."
          : recordId
            ? "Update financial record"
            : "Save financial record"}
      </Button>
    </form>
  );
}
