import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getWalletDetail } from "@/data/finance-repository";
import { WalletForm } from "@/features/wallets/wallet-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Edit Wallet", "Update this wallet.");

export default async function EditWalletPage({
  params,
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const snapshot = await getWalletDetail(walletId);

  if (!snapshot) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Wallet" description="Update wallet details." />
      <WalletForm
        walletId={walletId}
        defaultValues={{
          name: snapshot.wallet.name,
          type: snapshot.wallet.type,
          nativeCurrency: snapshot.wallet.nativeCurrency,
          description: snapshot.wallet.description ?? "",
          color: snapshot.wallet.color,
          icon: snapshot.wallet.icon,
        }}
      />
    </div>
  );
}
