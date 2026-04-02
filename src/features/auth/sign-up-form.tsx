"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signUpAction } from "@/features/auth/actions";
import { signUpSchema } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await signUpAction(values);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Account created. Complete onboarding next.");
          router.push("/onboarding");
          router.refresh();
        }),
      )}
    >
      <div>
        <Label>Full name</Label>
        <Input {...form.register("fullName")} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" {...form.register("email")} />
      </div>
      <div>
        <Label>Password</Label>
        <Input type="password" {...form.register("password")} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
