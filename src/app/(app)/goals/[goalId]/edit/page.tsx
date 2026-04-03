import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getGoalDetail, getWallets } from "@/data/finance-repository";
import { GoalForm } from "@/features/goals/goal-form";

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;
  const [wallets, snapshot] = await Promise.all([getWallets(), getGoalDetail(goalId)]);

  if (!snapshot) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Goals" title="Edit goal" description="Adjust target amount, timeline, and linked wallet." />
      <GoalForm
        wallets={wallets}
        goalId={goalId}
        defaultValues={{
          name: snapshot.goal.name,
          description: snapshot.goal.description ?? "",
          walletId: snapshot.goal.walletId ?? "",
          targetAmount: snapshot.goal.targetAmount,
          savedAmount: snapshot.goal.savedAmount,
          targetDate: snapshot.goal.targetDate?.slice(0, 10) ?? "",
          priority: snapshot.goal.priority,
          type: snapshot.goal.type,
          milestones: snapshot.milestones.map((milestone) => ({
            id: milestone.id,
            title: milestone.title,
            targetAmount: milestone.targetAmount,
            dueDate: milestone.dueDate?.slice(0, 10) ?? "",
            isCompleted: milestone.isCompleted,
            notes: milestone.notes ?? "",
          })),
          phases: snapshot.phases.map((phase) => ({
            id: phase.id,
            order: phase.order || 1,
            title: phase.title,
            description: phase.description ?? "",
            estimatedCost: phase.estimatedCost,
            actualCost: phase.actualCost,
            status: phase.status,
            completionDate: phase.completionDate?.slice(0, 10) ?? "",
          })),
        }}
      />
    </div>
  );
}
