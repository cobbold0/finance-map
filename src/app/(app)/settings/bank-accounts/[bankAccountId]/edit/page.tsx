import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getBankAccounts } from "@/data/finance-repository";
import { BankAccountForm } from "@/features/settings/bank-account-form";

export default async function EditBankAccountPage({
  params,
}: {
  params: Promise<{ bankAccountId: string }>;
}) {
  const { bankAccountId } = await params;
  const bankAccounts = await getBankAccounts();
  const detail = bankAccounts.find((item) => item.id === bankAccountId);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Bank details" title="Edit bank details" description="Update bank labels, account fields, and share-ready metadata." />
      <BankAccountForm
        bankAccountId={bankAccountId}
        defaultValues={{
          label: detail.label,
          accountName: detail.account_name,
          accountNumber: detail.account_number,
          bankName: detail.bank_name,
          branch: detail.branch ?? "",
          swiftCode: detail.swift_code ?? "",
          mobileMoneyProvider: detail.mobile_money_provider ?? "",
          mobileMoneyNumber: detail.mobile_money_number ?? "",
          notes: detail.notes ?? "",
          isPrimary: detail.is_primary ?? false,
        }}
      />
    </div>
  );
}
