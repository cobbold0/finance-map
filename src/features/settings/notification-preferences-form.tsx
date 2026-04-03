"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { saveNotificationPreferencesAction } from "@/features/settings/actions";
import { notificationPreferencesSchema } from "@/features/settings/schemas";
import { requestBrowserNotificationPermission } from "@/lib/pwa";
import { Button } from "@/components/ui/button";

type NotificationPreferenceValues = z.infer<
  typeof notificationPreferencesSchema
>;

const preferenceOptions: Array<{
  field: keyof NotificationPreferenceValues;
  title: string;
  description: string;
}> = [
  {
    field: "browserEnabled",
    title: "Browser notifications",
    description: "Allow delivery through the installed PWA or browser.",
  },
  {
    field: "salaryReminder",
    title: "Salary reminders",
    description: "Get nudged around your expected salary date.",
  },
  {
    field: "bonusReminder",
    title: "Bonus reminders",
    description: "Keep variable income visible when bonuses are expected.",
  },
  {
    field: "milestoneReminder",
    title: "Goal milestone alerts",
    description: "Know when a savings milestone or project checkpoint is near.",
  },
  {
    field: "monthlyReviewReminder",
    title: "Monthly review reminders",
    description: "Prompt a calm end-of-month review of wallets, goals, and spending.",
  },
  {
    field: "budgetWarningReminder",
    title: "Budget warning alerts",
    description: "Flag category pressure before a limit is crossed.",
  },
  {
    field: "reconciliationReminder",
    title: "Reconciliation reminders",
    description: "Remember to confirm balances and tidy transaction history.",
  },
];

export function NotificationPreferencesForm({
  defaultValues,
}: {
  defaultValues: NotificationPreferenceValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<NotificationPreferenceValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues,
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          if (values.browserEnabled) {
            const permission = await requestBrowserNotificationPermission();

            if (permission === "unsupported") {
              toast.error("This browser does not support notifications.");
              return;
            }

            if (permission === "denied") {
              toast.error("Allow browser notifications to enable reminder delivery.");
              return;
            }
          }

          const result = await saveNotificationPreferencesAction(values);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Notification preferences updated.");
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-3">
        {preferenceOptions.map((option) => (
          <label
            key={option.field}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              {...form.register(option.field)}
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">{option.title}</span>
              <span className="block text-sm text-muted-foreground">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save notification preferences"}
      </Button>
    </form>
  );
}
