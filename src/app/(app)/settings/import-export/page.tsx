import Link from "next/link";
import { Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ImportExportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Import / export"
        title="Move your data safely"
        description="Import transactions with CSV, and export a full JSON bundle for portability and backup."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Upload className="h-5 w-5 text-primary" />
              CSV import
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Use the transaction import screen to preview rows, validate fields,
              and map a CSV into wallet transactions safely.
            </p>
            <Button asChild>
              <Link href="/transactions/import">Open import</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Download className="h-5 w-5 text-primary" />
              JSON export
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Export wallets, transactions, budgets, goals, reminders, and bank
              account details as one structured bundle.
            </p>
            <Button asChild>
              <a href="/api/export">Download JSON</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
