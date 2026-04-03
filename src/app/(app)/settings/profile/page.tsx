import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUserProfile, getUserSettings } from "@/data/finance-repository";
import { ProfileSettingsForm } from "@/features/settings/profile-settings-form";

export default async function ProfileSettingsPage() {
  const [profile, settings] = await Promise.all([
    getCurrentUserProfile(),
    getUserSettings(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Profile and finance preferences"
        description="Configure your identity, base currency, and salary cadence without mixing in reminder delivery controls."
      />
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Profile basics</h2>
            <p className="text-sm text-muted-foreground">
              These settings shape your financial defaults across the app.
            </p>
          </div>
          <ProfileSettingsForm
            defaultValues={{
              fullName: profile?.fullName ?? "",
              baseCurrency: profile?.baseCurrency ?? "GHS",
              salaryDate: settings.salaryDate ?? 25,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
