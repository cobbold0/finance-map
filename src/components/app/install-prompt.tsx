"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPromptCard() {
  const visible = useUiStore((state) => state.installPromptVisible);
  const setVisible = useUiStore((state) => state.setInstallPromptVisible);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferredPrompt) {
    return null;
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Install Finance Map</p>
          <p className="text-sm text-muted-foreground">
            Add the app to your home screen for faster access.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setVisible(false)}>
            Later
          </Button>
          <Button
            onClick={async () => {
              await deferredPrompt.prompt();
              setVisible(false);
            }}
          >
            <Download className="h-4 w-4" />
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
