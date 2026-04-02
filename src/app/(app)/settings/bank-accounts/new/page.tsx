import { PageHeader } from "@/components/app/page-header";
import { BankAccountForm } from "@/features/settings/bank-account-form";

export default function NewBankAccountPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Bank details" title="Add bank account details" description="Store bank and mobile money details for easy copy/share access." />
      <BankAccountForm />
    </div>
  );
}
