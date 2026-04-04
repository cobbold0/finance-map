import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getFinancialRecord } from "@/data/finance-repository";
import { FinancialRecordForm } from "@/features/settings/financial-record-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Edit Financial Record", "Update this financial record.");

export default async function EditFinancialRecordPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const record = await getFinancialRecord(recordId);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Financial Record"
        description="Update financial record details."
      />
      <FinancialRecordForm
        recordId={recordId}
        defaultValues={{
          type: record.type,
          label: record.label,
          providerName: record.providerName,
          productName: record.productName ?? "",
          referenceNumber: record.referenceNumber ?? "",
          currency: record.currency,
          monthlyContribution: record.monthlyContribution,
          currentValue: record.currentValue,
          coverageAmount: record.coverageAmount,
          startDate: record.startDate ?? "",
          maturityDate: record.maturityDate ?? "",
          contactPerson: record.contactPerson ?? "",
          contactPhone: record.contactPhone ?? "",
          notes: record.notes ?? "",
        }}
      />
    </div>
  );
}
