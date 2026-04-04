import { PageHeader } from "@/components/app/page-header";
import { BankAccountForm } from "@/features/settings/bank-account-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Add Bank Account", "Create bank account details.");

export default function NewBankAccountPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Bank Account" description="Create bank account details." />
      <BankAccountForm />
    </div>
  );
}
