import { PageHeader } from "@/components/app/page-header";
import { getCurrentUserProfile, getNotificationPreferences } from "@/data/finance-repository";
import { PreferencesForm } from "@/features/settings/preferences-form";

export default async function ProfileSettingsPage() {
  const [profile, preferences] = await Promise.all([
    getCurrentUserProfile(),
    getNotificationPreferences(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Profile and finance preferences" description="Configure your base currency, reminder defaults, and profile details." />
      <PreferencesForm
        defaultValues={{
          fullName: profile?.fullName ?? "",
          baseCurrency: profile?.baseCurrency ?? "GHS",
          browserEnabled: preferences?.browserEnabled ?? false,
          salaryReminder: preferences?.salaryReminder ?? true,
          monthlyReviewReminder: preferences?.monthlyReviewReminder ?? true,
          budgetWarningReminder: preferences?.budgetWarningReminder ?? true,
          reconciliationReminder: preferences?.reconciliationReminder ?? true,
          salaryDate: 25,
        }}
      />
    </div>
  );
}
