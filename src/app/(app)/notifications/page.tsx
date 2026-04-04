import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import {
  getNotificationDeliveries,
  getNotificationPreferences,
  getReminders,
} from "@/data/finance-repository";
import { NotificationActionsCard } from "@/features/notifications/notification-actions-card";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Notifications", "Manage your reminders.");

export default async function NotificationsPage() {
  const [preferences, reminders, deliveries] = await Promise.all([
    getNotificationPreferences(),
    getReminders(),
    getNotificationDeliveries(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Manage reminders and alerts."
      />
      <NotificationActionsCard nextReminder={reminders[0]} />
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
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold">Recent delivery diagnostics</h2>
          {deliveries.length ? (
            deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {delivery.reminderTitle ?? "Reminder delivery"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {delivery.channel} · scheduled {delivery.scheduledFor ?? "n/a"}
                    </p>
                  </div>
                  <p className="text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    {delivery.status}
                  </p>
                </div>
                {delivery.errorMessage ? (
                  <p className="mt-2 text-sm text-red-300">{delivery.errorMessage}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No delivery attempts logged yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
