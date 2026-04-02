import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Preferences and configuration"
        description="Manage profile, currency, notifications, bank details, and data portability."
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
                  Open this area to configure the product around your financial workflow.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
