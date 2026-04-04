import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUserProfile, getUserSettings } from "@/data/finance-repository";
import { ProfileSettingsForm } from "@/features/settings/profile-settings-form";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Profile", "Manage your profile.");

export default async function ProfileSettingsPage() {
  const [profile, settings] = await Promise.all([
    getCurrentUserProfile(),
    getUserSettings(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your profile and defaults."
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
