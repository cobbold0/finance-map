"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpFormAction, type AuthFormState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {
  error: null,
  fieldErrors: {},
};

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpFormAction, initialState);

  return (
    <form className="space-y-5" action={formAction}>
      <div>
        <Label htmlFor="full-name">Full name</Label>
        <Input
          id="full-name"
          name="fullName"
          autoComplete="name"
          placeholder="Ama Mensah"
          minLength={2}
          required
        />
        <FormError message={state.fieldErrors?.fullName} />
      </div>
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
          <span className="text-xs text-muted-foreground">Use 8+ characters</span>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a secure password"
          minLength={8}
          required
        />
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          After this, you will set your currency, first wallet, and reminder preferences.
        </p>
        <FormError message={state.fieldErrors?.password} />
      </div>
      <FormError message={state.error ?? undefined} />
      <SubmitButton
        idleLabel="Create account and continue"
        pendingLabel="Creating account..."
      />
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
