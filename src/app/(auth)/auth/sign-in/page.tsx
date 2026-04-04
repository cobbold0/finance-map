import Link from "next/link";
import type { Metadata } from "next";
import { redirectIfAuthenticated } from "@/data/auth";
import { LogoMark } from "@/components/app/logo-mark";
import { SignInForm } from "@/features/auth/sign-in-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Access your account.",
};

export default async function SignInPage() {
  await redirectIfAuthenticated();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-semibold">Sign in</p>
              <p className="text-sm text-muted-foreground">Access your account.</p>
            </div>
          </div>
          <SignInForm />
          <p className="text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/auth/sign-up" className="text-primary">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
