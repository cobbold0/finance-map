import { PageHeader } from "@/components/app/page-header";
import { WalletForm } from "@/features/wallets/wallet-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Add Wallet", "Create a wallet.");

export default function NewWalletPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Wallet"
        description="Create a new wallet."
      />
      <WalletForm />
    </div>
  );
}
