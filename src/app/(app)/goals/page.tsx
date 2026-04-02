import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Progress } from "@/components/ui/progress";
import { calculateGoalProgress, formatCurrency, getGoalRemaining } from "@/domain/finance";
import { getCurrentUserProfile, getGoals } from "@/data/finance-repository";

export default async function GoalsPage() {
  const [profile, goals] = await Promise.all([getCurrentUserProfile(), getGoals()]);
  const currency = profile?.baseCurrency ?? "GHS";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Goals"
        title="Plan money around what matters"
        description="Track target amounts, milestones, project phases, and progress toward meaningful outcomes."
        action={
          <Button asChild>
            <Link href="/goals/new">New goal</Link>
          </Button>
        }
      />
      {goals.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{goal.name}</h2>
                    <p className="text-sm text-muted-foreground">{goal.description ?? "No description yet"}</p>
                  </div>
                  <Button asChild variant="ghost">
                    <Link href={`/goals/${goal.id}`}>Open</Link>
                  </Button>
                </div>
                <Progress value={calculateGoalProgress(goal)} />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(goal.savedAmount, currency)} saved</span>
                  <span>{formatCurrency(getGoalRemaining(goal), currency)} left</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No goals yet"
          description="Create a savings or project goal to track progress with milestones and structure."
          action={
            <Button asChild>
              <Link href="/goals/new">Create goal</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
