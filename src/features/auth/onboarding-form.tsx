"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Bell, CircleUserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { CURRENCIES } from "@/domain/currencies";
import { completeOnboardingAction } from "@/features/auth/actions";
import { onboardingSchema } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";

type OnboardingValues = z.infer<typeof onboardingSchema>;

const steps = [
  {
    id: "identity",
    title: "About you",
    description: "Set your name and home currency so the app speaks your money language.",
    icon: CircleUserRound,
    fields: ["fullName", "baseCurrency"] as Array<keyof OnboardingValues>,
  },
  {
    id: "wallet",
    title: "First wallet",
    description: "Create the wallet you will use as your starting home for balances and activity.",
    icon: Wallet,
    fields: ["defaultWalletName", "salaryDate"] as Array<keyof OnboardingValues>,
  },
  {
    id: "alerts",
    title: "Alerts and limits",
    description: "Choose how early you want nudges before your month starts drifting off track.",
    icon: Bell,
    fields: ["budgetWarningThreshold", "browserEnabled"] as Array<keyof OnboardingValues>,
  },
] as const;

export function OnboardingForm({
  defaultName,
}: {
  defaultName?: string | null;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
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
  const currentStep = steps[stepIndex];
  const CurrentIcon = currentStep.icon;
  const progressValue = useMemo(
    () => ((stepIndex + 1) / steps.length) * 100,
    [stepIndex],
  );

  async function handleNextStep() {
    const isValid = await form.trigger(currentStep.fields);

    if (!isValid) {
      return;
    }

    setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  }

  return (
    <form
      className="space-y-6"
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
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              Step {stepIndex + 1} of {steps.length}
            </span>
            <span className="text-muted-foreground">{currentStep.title}</span>
          </div>
          <Progress value={progressValue} className="h-2.5" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <CurrentIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">{currentStep.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{currentStep.description}</p>
            </div>
          </div>

          {stepIndex === 0 ? (
            <div className="space-y-5">
              <div>
                <Label htmlFor="full-name">Full name</Label>
                <Input
                  id="full-name"
                  autoComplete="name"
                  placeholder="Ama Mensah"
                  {...form.register("fullName")}
                />
                <FormError message={form.formState.errors.fullName?.message} />
              </div>
              <div>
                <Label htmlFor="base-currency">Base currency</Label>
                <Select id="base-currency" {...form.register("baseCurrency")}>
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </Select>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  We will use this to summarize totals and reports across your wallets.
                </p>
                <FormError message={form.formState.errors.baseCurrency?.message} />
              </div>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="space-y-5">
              <div>
                <Label htmlFor="default-wallet-name">Default wallet name</Label>
                <Input
                  id="default-wallet-name"
                  placeholder="Main Wallet"
                  {...form.register("defaultWalletName")}
                />
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Start simple. You can add savings, business, emergency, or project wallets later.
                </p>
                <FormError message={form.formState.errors.defaultWalletName?.message} />
              </div>
              <div>
                <Label htmlFor="salary-date">Salary date</Label>
                <Input
                  id="salary-date"
                  type="number"
                  inputMode="numeric"
                  {...form.register("salaryDate", { valueAsNumber: true })}
                />
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  We use this to support reminders and monthly review timing.
                </p>
                <FormError message={form.formState.errors.salaryDate?.message} />
              </div>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="space-y-5">
              <div>
                <Label htmlFor="budget-warning-threshold">Budget warning threshold (%)</Label>
                <Input
                  id="budget-warning-threshold"
                  type="number"
                  inputMode="numeric"
                  {...form.register("budgetWarningThreshold", { valueAsNumber: true })}
                />
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Choose when Finance Map should start signaling that spending is nearing your limit.
                </p>
                <FormError message={form.formState.errors.budgetWarningThreshold?.message} />
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  {...form.register("browserEnabled")}
                />
                <span className="space-y-1">
                  <span className="block font-medium">Enable browser reminders</span>
                  <span className="block leading-6 text-muted-foreground">
                    Helpful for salary, milestone, and review nudges. You can change this later.
                  </span>
                </span>
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-6 text-muted-foreground">
          {stepIndex === steps.length - 1
            ? "You are one step away from your dashboard."
            : "You can adjust any of these choices later in settings."}
        </div>
        <div className="flex gap-3">
          {stepIndex > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStepIndex((value) => Math.max(value - 1, 0))}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : null}
          {stepIndex < steps.length - 1 ? (
            <Button type="button" onClick={handleNextStep}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={pending}>
              {pending ? "Finishing..." : "Finish setup"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
