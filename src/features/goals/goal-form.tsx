"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Wallet } from "@/domain/models";
import { saveGoalAction } from "@/features/goals/actions";
import { goalSchema } from "@/features/goals/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type GoalValues = import("zod").input<typeof goalSchema>;

export function GoalForm({
  wallets,
  goalId,
  defaultValues,
}: {
  wallets: Wallet[];
  goalId?: string;
  defaultValues?: Partial<GoalValues>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<GoalValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      walletId: defaultValues?.walletId ?? "",
      targetAmount: defaultValues?.targetAmount ?? 0,
      savedAmount: defaultValues?.savedAmount ?? 0,
      targetDate: defaultValues?.targetDate ?? "",
      priority: defaultValues?.priority ?? "medium",
      type: defaultValues?.type ?? "generic",
      milestones: defaultValues?.milestones ?? [],
      phases: defaultValues?.phases ?? [],
    },
  });
  const goalType = useWatch({
    control: form.control,
    name: "type",
  });
  const milestones = useFieldArray({
    control: form.control,
    name: "milestones",
  });
  const phases = useFieldArray({
    control: form.control,
    name: "phases",
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveGoalAction(values, goalId);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success(goalId ? "Goal updated." : "Goal created.");
          router.push("/goals");
          router.refresh();
        }),
      )}
    >
      <div>
        <Label>Goal name</Label>
        <Input {...form.register("name")} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea {...form.register("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Linked wallet</Label>
          <Select {...form.register("walletId")}>
            <option value="">Independent goal</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Type</Label>
          <Select {...form.register("type")}>
            <option value="generic">Generic</option>
            <option value="building_project">Building project</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Target amount</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register("targetAmount", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Saved amount</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register("savedAmount", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label>Priority</Label>
          <Select {...form.register("priority")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
      </div>
      <div>
        <Label>Target date</Label>
        <Input type="date" {...form.register("targetDate")} />
      </div>
      <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Milestones</h2>
            <p className="text-sm text-muted-foreground">
              Break this goal into measurable checkpoints.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              milestones.append({
                title: "",
                targetAmount: null,
                dueDate: "",
                isCompleted: false,
                notes: "",
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add milestone
          </Button>
        </div>
        {milestones.fields.length ? (
          <div className="space-y-4">
            {milestones.fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">Milestone {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => milestones.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input {...form.register(`milestones.${index}.title`)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Target amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`milestones.${index}.targetAmount`, {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                  </div>
                  <div>
                    <Label>Due date</Label>
                    <Input type="date" {...form.register(`milestones.${index}.dueDate`)} />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea {...form.register(`milestones.${index}.notes`)} />
                </div>
                <label className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-white/10 bg-white/[0.03]"
                    {...form.register(`milestones.${index}.isCompleted`)}
                  />
                  Mark milestone as completed
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No milestones added yet.</p>
        )}
      </div>
      <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Project phases</h2>
            <p className="text-sm text-muted-foreground">
              Add phases for goals that need a roadmap or build plan.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              phases.append({
                order: phases.fields.length + 1,
                title: "",
                description: "",
                estimatedCost: null,
                actualCost: null,
                status: "planned",
                completionDate: "",
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add phase
          </Button>
        </div>
        {goalType !== "building_project" ? (
          <p className="text-sm text-muted-foreground">
            Switch the goal type to building project if you want to use phases as
            part of the plan.
          </p>
        ) : null}
        {phases.fields.length ? (
          <div className="space-y-4">
            {phases.fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">Phase {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => phases.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Order</Label>
                    <Input
                      type="number"
                      {...form.register(`phases.${index}.order`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select {...form.register(`phases.${index}.status`)}>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input {...form.register(`phases.${index}.title`)} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea {...form.register(`phases.${index}.description`)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Estimated cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`phases.${index}.estimatedCost`, {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                  </div>
                  <div>
                    <Label>Actual cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register(`phases.${index}.actualCost`, {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                  </div>
                  <div>
                    <Label>Completion date</Label>
                    <Input
                      type="date"
                      {...form.register(`phases.${index}.completionDate`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No project phases added yet.</p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : goalId ? "Update goal" : "Create goal"}
      </Button>
    </form>
  );
}
