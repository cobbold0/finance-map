"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

export function NotificationPermissionCard() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() =>
    typeof window === "undefined"
      ? "default"
      : "Notification" in window
        ? Notification.permission
        : "unsupported",
  );
  const visible = useUiStore((state) => state.notificationPromptVisible);
  const setVisible = useUiStore((state) => state.setNotificationPromptVisible);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const syncPermission = () => setPermission(Notification.permission);
    syncPermission();
    document.addEventListener("visibilitychange", syncPermission);

    return () => {
      document.removeEventListener("visibilitychange", syncPermission);
    };
  }, []);

  if (!visible || permission === "granted" || permission === "unsupported") {
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
              const result = await Notification.requestPermission();
              setPermission(result);
              setVisible(false);
            }}
          >
            Allow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
