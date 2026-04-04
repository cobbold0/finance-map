import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Import Transactions", "Import transactions from CSV.");

export default function TransactionsImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Transactions"
        description="Import transactions from CSV."
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
