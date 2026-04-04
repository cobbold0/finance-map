import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Download,
  Landmark,
  Layers3,
  LogOut,
  Shield,
  UserRound,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { signOutAction } from "@/features/auth/actions";

const settingLinks = [
  {
    label: "Profile & preferences",
    description: "Name, currency defaults, and personal setup choices.",
    href: "/settings/profile",
    icon: UserRound,
  },
  {
    label: "Notification preferences",
    description: "Control reminders, review prompts, and alerts.",
    href: "/settings/preferences",
    icon: Bell,
  },
  {
    label: "Financial records",
    description: "Pensions, investments, insurance, and reference records.",
    href: "/settings/financial-records",
    icon: Shield,
  },
  {
    label: "Budget categories",
    description: "Manage the categories used to track monthly spending.",
    href: "/settings/budget-categories",
    icon: Layers3,
  },
  {
    label: "Bank account details",
    description: "Store transfer details, mobile money info, and payout accounts.",
    href: "/settings/bank-accounts",
    icon: Landmark,
  },
  {
    label: "Import / export",
    description: "Bring data in, export records, and keep backups tidy.",
    href: "/settings/import-export",
    icon: Download,
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="Manage your profile, currency, notifications, bank details, and exports."
      />
      <Card>
        <CardContent className="p-0">
          {settingLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 border-b border-border px-4 py-4 transition last:border-b-0 hover:bg-secondary md:px-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </CardContent>
      </Card>
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
