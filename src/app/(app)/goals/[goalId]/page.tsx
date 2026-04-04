import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilLine } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HeaderActionLink, PageHeader } from "@/components/app/page-header";
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
  const completedMilestones = snapshot.milestones.filter((milestone) => milestone.isCompleted).length;
  const completedPhases = snapshot.phases.filter((phase) => phase.status === "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Goal detail"
        title={snapshot.goal.name}
        description={
          snapshot.goal.description ??
          "Track progress, milestones, and roadmap structure."
        }
        action={
          <HeaderActionLink href={`/goals/${goalId}/edit`} icon={PencilLine}>
            Update progress
          </HeaderActionLink>
        }
      />
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>
              {snapshot.milestones.length} milestone{snapshot.milestones.length === 1 ? "" : "s"}
            </Badge>
            <Badge>
              {snapshot.phases.length} phase{snapshot.phases.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(snapshot.goal.savedAmount, currency)}</p>
          <Progress value={calculateGoalProgress(snapshot.goal)} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(snapshot.goal.targetAmount, currency)} target</span>
            <span>{formatCurrency(getGoalRemaining(snapshot.goal), currency)} remaining</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-sm text-muted-foreground">Milestone progress</p>
              <p className="mt-2 text-lg font-semibold">
                {completedMilestones} of {snapshot.milestones.length} complete
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-sm text-muted-foreground">Phase progress</p>
              <p className="mt-2 text-lg font-semibold">
                {completedPhases} of {snapshot.phases.length} complete
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link href={`/goals/${goalId}/edit`}>
                <PencilLine className="h-4 w-4" />
                Update saved amount
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-lg font-semibold">Milestones</h2>
            {snapshot.milestones.length ? (
              snapshot.milestones.map((milestone) => (
                <div key={milestone.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{milestone.title}</p>
                    <Badge
                      className={
                        milestone.isCompleted
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                          : undefined
                      }
                    >
                      {milestone.isCompleted ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>
                      {milestone.targetAmount != null
                        ? formatCurrency(milestone.targetAmount, currency)
                        : "No target amount"}
                    </span>
                    <span>
                      {milestone.dueDate
                        ? format(new Date(milestone.dueDate), "dd MMM yyyy")
                        : "No due date"}
                    </span>
                  </div>
                  {milestone.notes ? (
                    <p className="text-sm text-muted-foreground">{milestone.notes}</p>
                  ) : null}
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
                <div key={phase.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{phase.title}</p>
                    <Badge
                      className={
                        phase.status === "completed"
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                          : phase.status === "in_progress"
                            ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                            : undefined
                      }
                    >
                      {phase.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>Phase {phase.order}</span>
                    <span>
                      {phase.estimatedCost != null
                        ? `Est. ${formatCurrency(phase.estimatedCost, currency)}`
                        : "No estimate"}
                    </span>
                    <span>
                      {phase.actualCost != null
                        ? `Actual ${formatCurrency(phase.actualCost, currency)}`
                        : "No actual cost"}
                    </span>
                  </div>
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
