import { PageHeader } from "@/components/app/page-header";
import { FinancialRecordForm } from "@/features/settings/financial-record-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Add Financial Record", "Create a financial record.");

export default function NewFinancialRecordPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Financial Record"
        description="Create a new financial record."
      />
      <FinancialRecordForm />
    </div>
  );
}
