import Link from "next/link";
import { redirectIfAuthenticated } from "@/data/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/features/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your account.",
};

export default async function SignUpPage() {
  await redirectIfAuthenticated();

  return (
    <AuthShell
      title="Sign up"
      description="Create your account."
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
