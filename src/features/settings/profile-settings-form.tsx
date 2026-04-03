"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CURRENCIES } from "@/domain/currencies";
import { saveProfileSettingsAction } from "@/features/settings/actions";
import { profileSettingsSchema } from "@/features/settings/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;

export function ProfileSettingsForm({
  defaultValues,
}: {
  defaultValues: ProfileSettingsValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues,
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveProfileSettingsAction(values);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Profile settings updated.");
          router.refresh();
        }),
      )}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Full name</Label>
          <Input {...form.register("fullName")} />
        </div>
        <div>
          <Label>Salary date</Label>
          <Input type="number" {...form.register("salaryDate", { valueAsNumber: true })} />
        </div>
      </div>
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
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile settings"}
      </Button>
    </form>
  );
}
