"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { goalSchema } from "@/features/goals/schemas";

export async function saveGoalAction(values: unknown, goalId?: string) {
  const payload = goalSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid goal." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  const record = {
    user_id: user.id,
    name: payload.data.name,
    description: payload.data.description || null,
    target_amount: payload.data.targetAmount,
    current_amount: payload.data.savedAmount,
    target_date: payload.data.targetDate || null,
    priority: payload.data.priority,
    goal_type: payload.data.type,
    linked_wallet_id: payload.data.walletId || null,
  };

  const query = goalId
    ? supabase
        .from("goals")
        .update(record)
        .eq("id", goalId)
        .eq("user_id", user.id)
        .select("id")
        .single()
    : supabase.from("goals").insert(record).select("id").single();

  const { data: goalRecord, error } = await query;

  if (error) {
    return { error: error.message };
  }

  const persistedGoalId = goalRecord?.id ?? goalId;

  if (!persistedGoalId) {
    return { error: "Unable to save goal details." };
  }

  const { data: existingMilestones } = await supabase
    .from("goal_milestones")
    .select("id")
    .eq("goal_id", persistedGoalId);

  const nextMilestones = payload.data.milestones
    .filter((milestone) => milestone.title.trim().length > 0)
    .map((milestone) => ({
      id: milestone.id ?? randomUUID(),
      goal_id: persistedGoalId,
      name: milestone.title.trim(),
      target_amount: milestone.targetAmount,
      target_date: milestone.dueDate ? new Date(`${milestone.dueDate}T00:00:00`).toISOString() : null,
      is_completed: milestone.isCompleted,
      notes: milestone.notes?.trim() || null,
    }));

  const milestoneIdsToKeep = nextMilestones
    .map((milestone) => milestone.id)
    .filter((value): value is string => Boolean(value));

  const milestoneIdsToDelete = (existingMilestones ?? [])
    .map((milestone) => milestone.id)
    .filter((id) => !milestoneIdsToKeep.includes(id));

  if (milestoneIdsToDelete.length) {
    const { error: deleteMilestonesError } = await supabase
      .from("goal_milestones")
      .delete()
      .in("id", milestoneIdsToDelete)
      .eq("goal_id", persistedGoalId);

    if (deleteMilestonesError) {
      return { error: deleteMilestonesError.message };
    }
  }

  if (nextMilestones.length) {
    const { error: milestonesError } = await supabase
      .from("goal_milestones")
      .upsert(nextMilestones);

    if (milestonesError) {
      return { error: milestonesError.message };
    }
  }

  const { data: existingPhases } = await supabase
    .from("roadmap_phases")
    .select("id")
    .eq("goal_id", persistedGoalId);

  const nextPhases = payload.data.phases
    .filter((phase) => phase.title.trim().length > 0)
    .map((phase, index) => ({
      id: phase.id ?? randomUUID(),
      goal_id: persistedGoalId,
      phase_number: phase.order || index + 1,
      name: phase.title.trim(),
      description: phase.description?.trim() || null,
      estimated_cost: phase.estimatedCost,
      actual_cost: phase.actualCost ?? 0,
      is_completed: phase.status === "completed",
      completion_date:
        phase.completionDate && phase.status === "completed"
          ? new Date(`${phase.completionDate}T00:00:00`).toISOString()
          : null,
      notes: null,
    }));

  const phaseIdsToKeep = nextPhases
    .map((phase) => phase.id)
    .filter((value): value is string => Boolean(value));

  const phaseIdsToDelete = (existingPhases ?? [])
    .map((phase) => phase.id)
    .filter((id) => !phaseIdsToKeep.includes(id));

  if (phaseIdsToDelete.length) {
    const { error: deletePhasesError } = await supabase
      .from("roadmap_phases")
      .delete()
      .in("id", phaseIdsToDelete)
      .eq("goal_id", persistedGoalId);

    if (deletePhasesError) {
      return { error: deletePhasesError.message };
    }
  }

  if (nextPhases.length) {
    const { error: phasesError } = await supabase
      .from("roadmap_phases")
      .upsert(nextPhases);

    if (phasesError) {
      return { error: phasesError.message };
    }
  }

  revalidatePath("/goals");
  revalidatePath(`/goals/${persistedGoalId}`);
  revalidatePath(`/goals/${persistedGoalId}/edit`);
  revalidatePath("/");
  return { success: true };
}
