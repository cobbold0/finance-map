"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInFormAction, type AuthFormState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {
  error: null,
  fieldErrors: {},
};

export function SignInForm() {
  const [state, formAction] = useActionState(signInFormAction, initialState);

  return (
    <form className="space-y-5" action={formAction}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <FormError message={state.fieldErrors?.email} />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Password</Label>
          <span className="text-xs text-muted-foreground">At least 8 characters</span>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          minLength={8}
          required
        />
        <FormError message={state.fieldErrors?.password} />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Sign in to continue tracking balances, budget posture, and your latest money moves.
      </p>
      <FormError message={state.error ?? undefined} />
      <SubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
    </form>
  );
}

function SubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
