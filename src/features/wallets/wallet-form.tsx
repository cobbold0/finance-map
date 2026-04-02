"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CURRENCIES } from "@/domain/currencies";
import { saveWalletAction } from "@/features/wallets/actions";
import { walletSchema } from "@/features/wallets/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type WalletValues = z.infer<typeof walletSchema>;

export function WalletForm({
  walletId,
  defaultValues,
}: {
  walletId?: string;
  defaultValues?: Partial<WalletValues>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<WalletValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "checking",
      nativeCurrency: defaultValues?.nativeCurrency ?? "GHS",
      description: defaultValues?.description ?? "",
      color: defaultValues?.color ?? "#3B82F6",
      icon: defaultValues?.icon ?? "wallet",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveWalletAction(values, walletId);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success(walletId ? "Wallet updated." : "Wallet created.");
          router.push("/wallets");
          router.refresh();
        }),
      )}
    >
      <div>
        <Label>Name</Label>
        <Input {...form.register("name")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Wallet type</Label>
          <Select {...form.register("type")}>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="cash">Cash</option>
            <option value="business">Business</option>
            <option value="emergency_fund">Emergency Fund</option>
            <option value="project_wallet">Project Wallet</option>
          </Select>
        </div>
        <div>
          <Label>Currency</Label>
          <Select {...form.register("nativeCurrency")}>
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Icon label</Label>
          <Input {...form.register("icon")} />
        </div>
        <div>
          <Label>Accent color</Label>
          <Input {...form.register("color")} />
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea {...form.register("description")} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : walletId ? "Update wallet" : "Create wallet"}
      </Button>
    </form>
  );
}
