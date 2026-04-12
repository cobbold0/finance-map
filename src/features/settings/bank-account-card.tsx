"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useTransition } from "react";
import { Share2, Copy, Pencil, Trash2 } from "lucide-react";
import { deleteBankAccountAction } from "@/features/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatSummary(details: {
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string | null;
  swiftCode?: string | null;
  mobileMoneyProvider?: string | null;
  mobileMoneyNumber?: string | null;
}) {
  return [
    `${details.label}`,
    `Bank: ${details.bankName}`,
    `Account Name: ${details.accountName}`,
    `Account Number: ${details.accountNumber}`,
    details.branch ? `Branch: ${details.branch}` : null,
    details.swiftCode ? `Swift: ${details.swiftCode}` : null,
    details.mobileMoneyProvider ? `Mobile Money: ${details.mobileMoneyProvider}` : null,
    details.mobileMoneyNumber ? `Mobile Number: ${details.mobileMoneyNumber}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function BankAccountCard({
  detail,
}: {
  detail: {
    id: string;
    label: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch?: string | null;
    swiftCode?: string | null;
    mobileMoneyProvider?: string | null;
    mobileMoneyNumber?: string | null;
    notes?: string | null;
  };
}) {
  const [pending, startTransition] = useTransition();
  const summary = formatSummary(detail);

  async function copyValue(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  }

  async function shareSummary() {
    if (navigator.share) {
      await navigator.share({ title: detail.label, text: summary });
      return;
    }

    await navigator.clipboard.writeText(summary);
    toast.success("Full bank summary copied.");
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{detail.label}</h3>
            <p className="text-sm text-muted-foreground">{detail.bankName}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/settings/bank-accounts/${detail.id}/edit`}>
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteBankAccountAction(detail.id);

                  if (result?.error) {
                    toast.error(result.error);
                    return;
                  }

                  toast.success("Bank details deleted.");
                })
              }
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={shareSummary}>
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
        {[
          { label: "Account name", value: detail.accountName },
          { label: "Account number", value: detail.accountNumber },
          { label: "Branch", value: detail.branch },
          { label: "Swift code", value: detail.swiftCode },
          { label: "Mobile money", value: detail.mobileMoneyProvider },
          { label: "Mobile number", value: detail.mobileMoneyNumber },
        ].map((field) => {
          if (!field.value) {
            return null;
          }

          const safeValue = String(field.value);

          return (
            <div
              key={field.label}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {field.label}
                </p>
                <p className="mt-1 text-sm font-medium">{safeValue}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => copyValue(safeValue, field.label)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
