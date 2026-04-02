"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInAction } from "@/features/auth/actions";
import { signInSchema } from "@/features/auth/schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          const result = await signInAction(values);

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          toast.success("Signed in.");
          router.push("/");
          router.refresh();
        }),
      )}
    >
      <div>
        <Label>Email</Label>
        <Input type="email" {...form.register("email")} />
      </div>
      <div>
        <Label>Password</Label>
        <Input type="password" {...form.register("password")} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
