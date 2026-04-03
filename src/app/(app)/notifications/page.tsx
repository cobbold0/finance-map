import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { getNotificationPreferences, getReminders } from "@/data/finance-repository";
import { NotificationActionsCard } from "@/features/notifications/notification-actions-card";

export default async function NotificationsPage() {
  const [preferences, reminders] = await Promise.all([
    getNotificationPreferences(),
    getReminders(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Smart reminders and preferences"
        description="Prepare for in-app and browser notification flows without changing the data model later."
      />
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold">Reminder stream</h2>
          {reminders.length ? (
            reminders.map((reminder) => (
              <div key={reminder.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="font-medium">{reminder.title}</p>
                <p className="text-sm text-muted-foreground">{reminder.description ?? "Reminder scheduled"}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reminders scheduled yet.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-lg font-semibold">Current preference state</h2>
          <p className="text-sm text-muted-foreground">
            Browser notifications: {preferences?.browserEnabled ? "enabled" : "disabled"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
