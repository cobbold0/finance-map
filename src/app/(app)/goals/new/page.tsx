import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { getWallets } from "@/data/finance-repository";
import { GoalForm } from "@/features/goals/goal-form";

export default async function NewGoalPage() {
  const wallets = await getWallets();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Goals" title="Create goal" description="Build a financial target, savings goal, or roadmap-based project plan." />
      {wallets.length ? (
        <GoalForm wallets={wallets} />
      ) : (
        <EmptyState
          title="Create a wallet first"
          description="Goals can be independent, but linking one to a wallet becomes more useful once wallets exist."
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
