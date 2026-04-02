import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { formatCurrency } from "@/domain/finance";
import { getWallets } from "@/data/finance-repository";

export default async function WalletsPage() {
  const wallets = await getWallets();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wallets"
        title="Manage every wallet intentionally"
        description="Use separate wallets for checking, savings, business, cash, emergency funds, and project money."
        action={
          <Button asChild>
            <Link href="/wallets/new">New wallet</Link>
          </Button>
        }
      />
      {wallets.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{wallet.name}</h2>
                    <p className="text-sm text-muted-foreground">{wallet.description ?? "No notes yet"}</p>
                  </div>
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: wallet.color }} />
                </div>
                <p className="text-3xl font-semibold">
                  {formatCurrency(wallet.balance, wallet.nativeCurrency)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link href={`/wallets/${wallet.id}`}>Open</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href={`/wallets/${wallet.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Create your first wallet"
          description="Split money intentionally across checking, savings, emergency, and project balances."
          action={
            <Button asChild>
              <Link href="/wallets/new">Create wallet</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
