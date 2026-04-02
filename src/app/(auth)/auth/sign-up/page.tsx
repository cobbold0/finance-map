import Link from "next/link";
import { redirectIfAuthenticated } from "@/data/auth";
import { LogoMark } from "@/components/app/logo-mark";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function SignUpPage() {
  await redirectIfAuthenticated();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-semibold">Create account</p>
              <p className="text-sm text-muted-foreground">
                Start building your finance system.
              </p>
            </div>
          </div>
          <SignUpForm />
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-primary">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
