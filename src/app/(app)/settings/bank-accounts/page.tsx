import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { getBankAccounts } from "@/data/finance-repository";
import { BankAccountCard } from "@/features/settings/bank-account-card";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Bank Accounts", "View your bank accounts.");

export default async function BankAccountsPage() {
  const bankAccounts = await getBankAccounts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Accounts"
        description="View and manage bank account details."
        action={
          <HeaderActionLink href="/settings/bank-accounts/new" icon={Plus}>
            Add details
          </HeaderActionLink>
        }
      />
      {bankAccounts.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {bankAccounts.map((detail) => (
            <BankAccountCard
              key={detail.id}
              detail={{
                id: detail.id,
                label: detail.label,
                bankName: detail.bank_name,
                accountName: detail.account_name,
                accountNumber: detail.account_number,
                branch: detail.branch,
                swiftCode: detail.swift_code,
                mobileMoneyProvider: detail.mobile_money_provider,
                mobileMoneyNumber: detail.mobile_money_number,
                notes: detail.notes,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No bank details yet"
          description="Save payout, transfer, or mobile money details so each field can be copied or shared quickly."
          action={
            <Button asChild>
              <Link href="/settings/bank-accounts/new">Add bank details</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
