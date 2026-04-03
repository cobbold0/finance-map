import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

export default function TransactionsImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Import"
        title="Import transactions from CSV"
        description="Import historical transactions from CSV into your wallet-first ledger."
      />
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Use this screen to review mapped rows, validate transaction fields,
            and commit imports safely into your existing wallets.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
