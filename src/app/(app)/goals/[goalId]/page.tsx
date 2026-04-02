import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/app/page-header";
import { calculateGoalProgress, formatCurrency, getGoalRemaining } from "@/domain/finance";
import { getCurrentUserProfile, getGoalDetail } from "@/data/finance-repository";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;
  const [profile, snapshot] = await Promise.all([
    getCurrentUserProfile(),
    getGoalDetail(goalId),
  ]);

  if (!snapshot) {
    notFound();
  }

  const currency = profile?.baseCurrency ?? "GHS";

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Goal detail" title={snapshot.goal.name} description={snapshot.goal.description ?? "Track progress, milestones, and roadmap structure."} />
      <Card>
        <CardContent className="space-y-4">
          <p className="text-3xl font-semibold">{formatCurrency(snapshot.goal.savedAmount, currency)}</p>
          <Progress value={calculateGoalProgress(snapshot.goal)} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(snapshot.goal.targetAmount, currency)} target</span>
            <span>{formatCurrency(getGoalRemaining(snapshot.goal), currency)} remaining</span>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-lg font-semibold">Milestones</h2>
            {snapshot.milestones.length ? (
              snapshot.milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="font-medium">{milestone.title}</p>
                  <p className="text-sm text-muted-foreground">{milestone.dueDate ?? "No due date"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No milestones yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-lg font-semibold">Project phases</h2>
            {snapshot.phases.length ? (
              snapshot.phases.map((phase) => (
                <div key={phase.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="font-medium">{phase.title}</p>
                  <p className="text-sm text-muted-foreground">{phase.description ?? "No notes yet"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No phases yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
