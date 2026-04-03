"use client";

import { BellRing, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Reminder } from "@/domain/models";
import { usePwaStatus } from "@/hooks/use-pwa-status";
import {
  ensurePushSubscription,
  removePushSubscription,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
} from "@/lib/pwa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function getPermissionLabel(permission: string) {
  switch (permission) {
    case "granted":
      return "Granted";
    case "denied":
      return "Denied";
    case "unsupported":
      return "Unsupported";
    default:
      return "Not requested";
  }
}

function getPushLabel(status: ReturnType<typeof usePwaStatus>) {
  if (!status.isPushSupported) {
    return "Unsupported";
  }

  if (!status.isPushConfigured) {
    return "Not configured";
  }

  return status.isSubscribed ? "Registered" : "Not subscribed";
}

export function NotificationActionsCard({
  nextReminder,
}: {
  nextReminder?: Reminder;
}) {
  const status = usePwaStatus();

  const requestPermission = async () => {
    const permission = await requestBrowserNotificationPermission();

    if (permission === "granted") {
      const result = await ensurePushSubscription();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Browser notifications are ready.");
      return;
    }

    if (permission === "denied") {
      toast.error("The browser denied notification access.");
      return;
    }

    toast.message("Notification permission is not available in this browser.");
  };

  const sendTestNotification = async () => {
    const delivered = await sendBrowserNotification({
      title: "Finance Map test alert",
      body: "Notifications are active for reminders, budget warnings, and monthly reviews.",
      tag: "finance-map-test",
      url: "/notifications",
    });

    if (!delivered) {
      toast.error("Enable browser notifications first.");
      return;
    }

    toast.success("Test notification sent.");
  };

  const sendReminderPreview = async () => {
    if (!nextReminder) {
      toast.message("No upcoming reminder is available to preview yet.");
      return;
    }

    const delivered = await sendBrowserNotification({
      title: nextReminder.title,
      body: nextReminder.description ?? "Reminder ready",
      tag: `reminder-${nextReminder.id}`,
      url: "/notifications",
      requireInteraction: nextReminder.kind === "budget_warning",
    });

    if (!delivered) {
      toast.error("Enable browser notifications first.");
      return;
    }

    toast.success("Reminder preview sent.");
  };

  const registerPush = async () => {
    const permission = await requestBrowserNotificationPermission();

    if (permission !== "granted") {
      toast.error("Browser notification permission is required first.");
      return;
    }

    const result = await ensurePushSubscription();

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("This browser is now registered for future push delivery.");
  };

  const disconnectPush = async () => {
    const result = await removePushSubscription();

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Push subscription removed from this browser.");
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Browser delivery</h2>
          <p className="text-sm text-muted-foreground">
            Service worker registration and local notification delivery are now
            wired for installable-PWA flows.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Service worker
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {status.isRegistrationEnabled
                ? status.isRegistered
                  ? "Registered"
                  : "Waiting for registration"
                : "Disabled in this environment"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BellRing className="h-4 w-4 text-primary" />
              Permission
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {getPermissionLabel(status.permission)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Send className="h-4 w-4 text-primary" />
              Push subscription
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {getPushLabel(status)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-sm font-medium">Upcoming reminder</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {nextReminder?.title ?? "No reminder scheduled"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={requestPermission}>
            Request permission
          </Button>
          <Button type="button" variant="secondary" onClick={registerPush}>
            Register push
          </Button>
          <Button type="button" onClick={sendTestNotification}>
            Send test alert
          </Button>
          <Button type="button" variant="ghost" onClick={sendReminderPreview}>
            Preview next reminder
          </Button>
          {status.isSubscribed ? (
            <Button type="button" variant="ghost" onClick={disconnectPush}>
              Remove push
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
