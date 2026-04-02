"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Wallet } from "@/domain/models";
import { saveGoalAction } from "@/features/goals/actions";
import { goalSchema } from "@/features/goals/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type GoalValues = z.infer<typeof goalSchema>;

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
    },
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
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : goalId ? "Update goal" : "Create goal"}
      </Button>
    </form>
  );
}
