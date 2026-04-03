import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getFinancialRecord } from "@/data/finance-repository";
import { FinancialRecordForm } from "@/features/settings/financial-record-form";

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
        eyebrow="Settings"
        title="Edit financial record"
        description="Update pension, investment, insurance, and provider information."
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
