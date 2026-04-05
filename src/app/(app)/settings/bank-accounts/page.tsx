import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { getBankAccounts, getMonoConnectedAccounts } from "@/data/finance-repository";
import { BankAccountCard } from "@/features/settings/bank-account-card";
import { ConnectMonoButton } from "@/features/settings/connect-mono-button";
import { MonoConnectionsPanel } from "@/features/settings/mono-connections-panel";
import { isMonoEnabled } from "@/lib/env";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Bank Accounts", "View your bank accounts.");

export default async function BankAccountsPage() {
  const monoEnabled = isMonoEnabled();
  const [bankAccounts, monoConnections] = await Promise.all([
    getBankAccounts(),
    monoEnabled ? getMonoConnectedAccounts() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Accounts"
        description="View and manage bank account details."
        action={
          <div className="flex flex-wrap gap-3">
            {monoEnabled ? <ConnectMonoButton /> : null}
            <HeaderActionLink href="/settings/bank-accounts/new" icon={Plus}>
              Add details
            </HeaderActionLink>
          </div>
        }
      />
      {monoEnabled ? (
        <MonoConnectionsPanel
          connections={monoConnections.map((connection) => ({
            id: connection.id,
            institutionName: connection.institutionName,
            accountName: connection.accountName,
            accountNumber: connection.accountNumber,
            accountType: connection.accountType,
            status: connection.status,
            lastSyncedAt: connection.lastSyncedAt,
          }))}
        />
      ) : null}
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
