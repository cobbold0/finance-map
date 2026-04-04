import { notFound } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { formatCurrency, getTransactionDisplayLabel } from "@/domain/finance";
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
            <HeaderActionLink
              href={`/transactions/new?type=income&walletId=${snapshot.wallet.id}`}
              icon={ArrowDownLeft}
              variant="outline"
            >
              Add income
            </HeaderActionLink>
            <HeaderActionLink
              href={`/transactions/new?type=expense&walletId=${snapshot.wallet.id}`}
              icon={ArrowUpRight}
            >
              Add expense
            </HeaderActionLink>
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
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {transaction.category ?? getTransactionDisplayLabel(transaction)}
                  </p>
                  <p className="text-sm text-muted-foreground">{transaction.notes ?? "No note"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(transaction.amount, transaction.nativeCurrency)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {getTransactionDisplayLabel(transaction)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
