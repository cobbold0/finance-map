import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { getNotificationPreferences, getReminders } from "@/data/finance-repository";
import { NotificationActionsCard } from "@/features/notifications/notification-actions-card";
import { NotificationPreferencesForm } from "@/features/settings/notification-preferences-form";

export default async function SettingsPreferencesPage() {
  const [preferences, reminders] = await Promise.all([
    getNotificationPreferences(),
    getReminders(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Notification preferences"
        description="Control browser delivery, reminder types, and the financial alerts you actually want to receive."
      />
      <NotificationActionsCard nextReminder={reminders[0]} />
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Reminder controls</h2>
            <p className="text-sm text-muted-foreground">
              Fine-tune what Finance Map should surface as salary, goal, budget,
              and reconciliation nudges.
            </p>
          </div>
          <NotificationPreferencesForm
            defaultValues={{
              browserEnabled: preferences?.browserEnabled ?? false,
              salaryReminder: preferences?.salaryReminder ?? true,
              bonusReminder: preferences?.bonusReminder ?? true,
              milestoneReminder: preferences?.milestoneReminder ?? true,
              monthlyReviewReminder: preferences?.monthlyReviewReminder ?? true,
              budgetWarningReminder: preferences?.budgetWarningReminder ?? true,
              reconciliationReminder: preferences?.reconciliationReminder ?? true,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
