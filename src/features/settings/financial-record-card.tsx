"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { FinancialRecord } from "@/domain/models";
import { formatCurrency } from "@/domain/finance";
import { deleteFinancialRecordAction } from "@/features/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatTypeLabel(type: FinancialRecord["type"]) {
  switch (type) {
    case "pension_tier_1":
      return "Pension Tier 1";
    case "pension_tier_2":
      return "Pension Tier 2";
    case "pension_tier_3":
      return "Pension Tier 3";
    case "investment":
      return "Investment";
    case "insurance":
      return "Insurance";
    default:
      return "Other";
  }
}

export function FinancialRecordCard({ record }: { record: FinancialRecord }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {formatTypeLabel(record.type)}
            </p>
            <h3 className="text-lg font-semibold">{record.label}</h3>
            <p className="text-sm text-muted-foreground">{record.providerName}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/settings/financial-records/${record.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteFinancialRecordAction(record.id);

                  if (result?.error) {
                    toast.error(result.error);
                    return;
                  }

                  toast.success("Financial record deleted.");
                })
              }
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {record.productName ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Product
              </p>
              <p className="mt-1 text-sm font-medium">{record.productName}</p>
            </div>
          ) : null}
          {record.referenceNumber ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Reference
              </p>
              <p className="mt-1 text-sm font-medium">{record.referenceNumber}</p>
            </div>
          ) : null}
          {record.monthlyContribution !== null ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Monthly contribution
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatCurrency(record.monthlyContribution, record.currency)}
              </p>
            </div>
          ) : null}
          {record.currentValue !== null ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Current value
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatCurrency(record.currentValue, record.currency)}
              </p>
            </div>
          ) : null}
          {record.coverageAmount !== null ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Coverage amount
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatCurrency(record.coverageAmount, record.currency)}
              </p>
            </div>
          ) : null}
          {record.contactPhone ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Contact
              </p>
              <p className="mt-1 text-sm font-medium">{record.contactPhone}</p>
            </div>
          ) : null}
        </div>
        {record.notes ? (
          <p className="text-sm leading-6 text-muted-foreground">{record.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
