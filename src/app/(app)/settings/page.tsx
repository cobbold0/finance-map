import Link from "next/link";
import { LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { signOutAction } from "@/features/auth/actions";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="Manage your profile, currency, notifications, bank details, and exports."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Profile & preferences", "/settings/profile"],
          ["Notification preferences", "/settings/preferences"],
          ["Bank account details", "/settings/bank-accounts"],
          ["Import / export", "/settings/import-export"],
        ].map(([label, href]) => (
          <Link key={href} href={href}>
            <Card>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">
                  Review and update this part of your account.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold">Session</p>
            <p className="text-sm text-muted-foreground">
              Sign out of this device when you are done managing your account.
            </p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
