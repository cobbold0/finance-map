import { getMonoConnectedAccounts } from "@/data/finance-repository";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { ConnectMonoButton } from "@/features/settings/connect-mono-button";
import { MonoConnectionsPanel } from "@/features/settings/mono-connections-panel";
import { isMonoEnabled } from "@/lib/env";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Import Transactions", "Import transactions from CSV.");

export default async function TransactionsImportPage() {
  const monoEnabled = isMonoEnabled();
  const monoConnections = monoEnabled ? await getMonoConnectedAccounts() : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Transactions"
        description={
          monoEnabled
            ? "Import transactions from CSV or preview them from Mono."
            : "Import transactions from CSV."
        }
        action={monoEnabled ? <ConnectMonoButton /> : undefined}
      />
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Use this screen to review mapped rows, validate transaction fields,
            and commit imports safely into your existing wallets.
          </p>
        </CardContent>
      </Card>
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
    </div>
  );
}
