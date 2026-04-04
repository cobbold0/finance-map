import Link from "next/link";
import { redirectIfAuthenticated } from "@/data/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/features/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Finance Map",
};

export default async function SignUpPage() {
  await redirectIfAuthenticated();

  return (
    <AuthShell
      eyebrow="Create account"
      title="Build a calmer money system in just a couple of minutes."
      description="Start with one wallet, set your base currency, and grow from there as your finances get clearer."
      mode="compact"
      footer={
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-primary">
            Sign in
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
