import { notFound } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { formatCurrency, getTransactionDisplayLabel } from "@/domain/finance";
import { getWalletDetail } from "@/data/finance-repository";
import { createPageMetadata } from "@/lib/page-metadata";
import { cn } from "@/lib/utils";

export const metadata = createPageMetadata("Wallet", "View wallet details.");

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

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
        title="Wallet"
        description={snapshot.wallet.description ?? "View balance and recent activity."}
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
        <CardContent className="space-y-4 p-0">
          <div className="px-5 pt-5">
            <h2 className="text-lg font-semibold">Recent transactions</h2>
          </div>
          <div className="hidden grid-cols-[0.9fr_1.7fr_0.8fr_0.9fr] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid">
            <p>Date</p>
            <p>Description</p>
            <p>Type</p>
            <p className="text-right">Amount</p>
          </div>
          <div>
            {snapshot.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border-b border-border px-4 py-4 last:border-b-0 md:px-5"
              >
                <div className="grid gap-3 md:grid-cols-[0.9fr_1.7fr_0.8fr_0.9fr] md:items-center md:gap-4">
                  <div className="text-sm text-muted-foreground">
                    {formatTransactionDate(transaction.occurredAt)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">
                      {transaction.category ?? getTransactionDisplayLabel(transaction)}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {transaction.notes ?? "No note"}
                    </p>
                  </div>
                  <div>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        transaction.displayType === "income" ||
                          transaction.displayType === "salary" ||
                          transaction.displayType === "bonus"
                          ? "bg-emerald-400/10 text-emerald-200"
                          : transaction.displayType === "expense"
                            ? "bg-amber-400/10 text-amber-100"
                            : "bg-background text-muted-foreground",
                      )}
                    >
                      {getTransactionDisplayLabel(transaction)}
                    </span>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount, transaction.nativeCurrency)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
