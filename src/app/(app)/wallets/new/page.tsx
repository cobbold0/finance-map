import { PageHeader } from "@/components/app/page-header";
import { WalletForm } from "@/features/wallets/wallet-form";

export default function NewWalletPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wallets"
        title="Create wallet"
        description="Set up a wallet for daily spending, savings, business funds, or a project."
      />
      <WalletForm />
    </div>
  );
}
