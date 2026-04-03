import { PageHeader } from "@/components/app/page-header";
import { FinancialRecordForm } from "@/features/settings/financial-record-form";

export default function NewFinancialRecordPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Add financial record"
        description="Add pensions, investments, insurance policies, and other important financial records."
      />
      <FinancialRecordForm />
    </div>
  );
}
