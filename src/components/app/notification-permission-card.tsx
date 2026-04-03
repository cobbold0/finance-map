"use client";

import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePwaStatus } from "@/hooks/use-pwa-status";
import {
  ensurePushSubscription,
  requestBrowserNotificationPermission,
} from "@/lib/pwa";
import { useUiStore } from "@/stores/ui-store";

export function NotificationPermissionCard() {
  const { isSupported, isRegistrationEnabled, permission } = usePwaStatus();
  const visible = useUiStore((state) => state.notificationPromptVisible);
  const setVisible = useUiStore((state) => state.setNotificationPromptVisible);

  if (
    !visible ||
    !isSupported ||
    !isRegistrationEnabled ||
    permission === "granted" ||
    permission === "unsupported"
  ) {
    return null;
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4 text-primary" />
            Enable local reminders
          </div>
          <p className="text-sm text-muted-foreground">
            Get browser notifications for budget warnings, monthly reviews, and
            upcoming finance tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setVisible(false)}>
            Not now
          </Button>
          <Button
            onClick={async () => {
              const nextPermission = await requestBrowserNotificationPermission();

              if (nextPermission === "granted") {
                const result = await ensurePushSubscription();

                if (result.error) {
                  toast.error(result.error);
                  return;
                }

                toast.success("Browser notifications enabled.");
                setVisible(false);
                return;
              }

              if (nextPermission === "denied") {
                toast.error("Notification permission was denied by the browser.");
                setVisible(false);
                return;
              }

              toast.message("Notification permission is still pending.");
            }}
          >
            Allow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
