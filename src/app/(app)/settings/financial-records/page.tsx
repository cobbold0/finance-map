import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { getFinancialRecords } from "@/data/finance-repository";
import { FinancialRecordCard } from "@/features/settings/financial-record-card";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Financial Records", "View your financial records.");

export default async function FinancialRecordsPage() {
  const records = await getFinancialRecords();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Records"
        description="View pensions, investments, and policies."
        action={
          <HeaderActionLink href="/settings/financial-records/new" icon={Plus}>
            Add record
          </HeaderActionLink>
        }
      />
      {records.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((record) => (
            <FinancialRecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No financial records yet"
          description="Add your pension tiers, investments, insurance policies, and other important records here."
          action={
            <Button asChild>
              <Link href="/settings/financial-records/new">Add financial record</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
