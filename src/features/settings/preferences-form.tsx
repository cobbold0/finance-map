"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CURRENCIES } from "@/domain/currencies";
import { savePreferencesAction } from "@/features/settings/actions";
import { preferencesSchema } from "@/features/settings/schemas";
import { requestBrowserNotificationPermission } from "@/lib/pwa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type PreferenceValues = z.infer<typeof preferencesSchema>;

export function PreferencesForm({
  defaultValues,
}: {
  defaultValues: PreferenceValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<PreferenceValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues,
  });

  return (
    <form
      className="space-y-4"
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

          const result = await savePreferencesAction(values);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Preferences updated.");
          router.refresh();
        }),
      )}
    >
      <div>
        <Label>Full name</Label>
        <Input {...form.register("fullName")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Base currency</Label>
          <Select {...form.register("baseCurrency")}>
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Salary date</Label>
          <Input type="number" {...form.register("salaryDate", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid gap-3">
        {[
          ["browserEnabled", "Enable browser notifications"],
          ["salaryReminder", "Salary reminders"],
          ["monthlyReviewReminder", "Monthly review reminders"],
          ["budgetWarningReminder", "Budget warning reminders"],
          ["reconciliationReminder", "Reconciliation reminders"],
        ].map(([name, label]) => (
          <label
            key={name}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
          >
            <input
              type="checkbox"
              className="h-4 w-4"
              {...form.register(name as keyof PreferenceValues)}
            />
            {label}
          </label>
        ))}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}
