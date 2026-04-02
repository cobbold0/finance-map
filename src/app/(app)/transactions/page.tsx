import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { formatCurrency } from "@/domain/finance";
import { getTransactions, getWallets } from "@/data/finance-repository";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const walletId = typeof params.walletId === "string" ? params.walletId : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const query = typeof params.query === "string" ? params.query : undefined;
  const [wallets, transactions] = await Promise.all([
    getWallets(),
    getTransactions({ walletId, type: (type as never) ?? "all", query }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Track every money movement"
        description="Search, filter, reconcile, and export your income, expenses, and transfers."
        action={
          <Button asChild>
            <Link href="/transactions/new">New transaction</Link>
          </Button>
        }
      />
      <Card>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
            <input
              name="query"
              defaultValue={query}
              placeholder="Search notes or category"
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm"
            />
            <select
              name="walletId"
              defaultValue={walletId}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm"
            >
              <option value="">All wallets</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={type}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm"
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>
      {transactions.length ? (
        <Card>
          <CardContent className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{transaction.category ?? "Uncategorized"}</p>
                  <p className="text-sm text-muted-foreground">{transaction.notes ?? "No note"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(transaction.amount, transaction.nativeCurrency)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {transaction.type}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No transactions found"
          description="Adjust your filters or record your first transaction to start building a usable money trail."
        />
      )}
    </div>
  );
}
