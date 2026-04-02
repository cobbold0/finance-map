"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CURRENCIES } from "@/domain/currencies";
import { completeOnboardingAction } from "@/features/auth/actions";
import { onboardingSchema } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type OnboardingValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm({
  defaultName,
}: {
  defaultName?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: defaultName ?? "",
      baseCurrency: "GHS",
      defaultWalletName: "Main Wallet",
      salaryDate: 25,
      budgetWarningThreshold: 80,
      browserEnabled: true,
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await completeOnboardingAction(values);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Onboarding completed.");
          router.push("/");
          router.refresh();
        }),
      )}
    >
      <div>
        <Label>Full name</Label>
        <Input {...form.register("fullName")} />
      </div>
      <div>
        <Label>Base currency</Label>
        <Select {...form.register("baseCurrency")}>
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Default wallet name</Label>
        <Input {...form.register("defaultWalletName")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Salary date</Label>
          <Input type="number" {...form.register("salaryDate", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Budget warning threshold (%)</Label>
          <Input
            type="number"
            {...form.register("budgetWarningThreshold", { valueAsNumber: true })}
          />
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4"
          {...form.register("browserEnabled")}
        />
        Enable browser notifications for reminders
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Finishing..." : "Finish setup"}
      </Button>
    </form>
  );
}
