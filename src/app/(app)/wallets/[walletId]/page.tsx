import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { formatCurrency } from "@/domain/finance";
import { getWalletDetail } from "@/data/finance-repository";

export default async function WalletDetailPage({
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
      <PageHeader
        eyebrow="Wallet detail"
        title={snapshot.wallet.name}
        description={snapshot.wallet.description ?? "Track balance, quick actions, and wallet history."}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/transactions/new?type=income&walletId=${snapshot.wallet.id}`}>Add income</Link>
            </Button>
            <Button asChild>
              <Link href={`/transactions/new?type=expense&walletId=${snapshot.wallet.id}`}>Add expense</Link>
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Current balance</p>
          <p className="text-4xl font-semibold">
            {formatCurrency(snapshot.wallet.balance, snapshot.wallet.nativeCurrency)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Recent transactions</h2>
          <div className="space-y-3">
            {snapshot.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{transaction.category ?? "Uncategorized"}</p>
                  <p className="text-sm text-muted-foreground">{transaction.notes ?? "No note"}</p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(transaction.amount, transaction.nativeCurrency)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
