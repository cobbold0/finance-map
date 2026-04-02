import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

export default function TransactionsImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Import"
        title="Import transactions from CSV"
        description="CSV import is wired into the architecture here; the next refinement step is parser preview, field mapping, and batch commit UX."
      />
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Drop in a CSV parser UI here using the existing data layer. The route
            and architecture are ready for transaction preview, validation, and
            save flows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
