import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
import { formatCurrency, getTransactionDisplayLabel } from "@/domain/finance";
import { getTransactions, getWallets } from "@/data/finance-repository";
import { cn } from "@/lib/utils";

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

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
  const walletNames = new Map(wallets.map((wallet) => [wallet.id, wallet.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transactions"
        title="Track every money movement"
        description="Search, filter, reconcile, and export your income, expenses, and transfers."
        action={
          <HeaderActionLink href="/transactions/new" icon={Plus}>
            New transaction
          </HeaderActionLink>
        }
      />
      <Card>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
            <input
              name="query"
              defaultValue={query}
              placeholder="Search notes or category"
              className="h-11 rounded-xl border border-border bg-secondary px-4 text-sm outline-none transition focus:border-primary/50"
            />
            <select
              name="walletId"
              defaultValue={walletId}
              className="h-11 rounded-xl border border-border bg-secondary px-4 text-sm outline-none transition focus:border-primary/50"
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
              className="h-11 rounded-xl border border-border bg-secondary px-4 text-sm outline-none transition focus:border-primary/50"
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
          <CardContent className="space-y-0 p-0">
            <div className="hidden grid-cols-[0.9fr_1.7fr_1fr_0.8fr_0.9fr] gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid">
              <p>Date</p>
              <p>Description</p>
              <p>Wallet</p>
              <p>Type</p>
              <p className="text-right">Amount</p>
            </div>
            {transactions.map((transaction) => (
              <Link
                key={transaction.id}
                href={`/transactions/${transaction.id}`}
                className="block border-b border-border px-4 py-4 transition last:border-b-0 hover:bg-secondary md:px-5"
              >
                <div className="grid gap-3 md:grid-cols-[0.9fr_1.7fr_1fr_0.8fr_0.9fr] md:items-center md:gap-4">
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
                  <div className="text-sm text-muted-foreground">
                    {walletNames.get(transaction.walletId) ?? "Wallet"}
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
              </Link>
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
