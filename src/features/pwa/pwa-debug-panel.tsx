"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePwaStatus } from "@/hooks/use-pwa-status";

type CacheSnapshot = {
  name: string;
  entries: string[];
};

type ServiceWorkerSnapshot = {
  registrationScope: string | null;
  controllerScriptUrl: string | null;
  activeScriptUrl: string | null;
  waitingScriptUrl: string | null;
  installingScriptUrl: string | null;
  caches: CacheSnapshot[];
  currentUrl: string | null;
  secureContext: boolean;
  standaloneDisplay: boolean;
};

const emptySnapshot: ServiceWorkerSnapshot = {
  registrationScope: null,
  controllerScriptUrl: null,
  activeScriptUrl: null,
  waitingScriptUrl: null,
  installingScriptUrl: null,
  caches: [],
  currentUrl: null,
  secureContext: false,
  standaloneDisplay: false,
};

function DebugRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-sm font-medium">{label}</p>
      <p className="max-w-[60%] text-right text-sm text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

async function readCaches() {
  if (typeof window === "undefined" || !("caches" in window)) {
    return [];
  }

  const names = await caches.keys();

  return Promise.all(
    names.map(async (name) => {
      const cache = await caches.open(name);
      const requests = await cache.keys();

      return {
        name,
        entries: requests.map((request) => {
          const url = new URL(request.url);
          return `${url.pathname}${url.search}`;
        }),
      };
    }),
  );
}

async function readSnapshot(): Promise<ServiceWorkerSnapshot> {
  if (typeof window === "undefined") {
    return emptySnapshot;
  }

  const registration =
    "serviceWorker" in navigator
      ? await navigator.serviceWorker.getRegistration()
      : undefined;

  return {
    registrationScope: registration?.scope ?? null,
    controllerScriptUrl: navigator.serviceWorker.controller?.scriptURL ?? null,
    activeScriptUrl: registration?.active?.scriptURL ?? null,
    waitingScriptUrl: registration?.waiting?.scriptURL ?? null,
    installingScriptUrl: registration?.installing?.scriptURL ?? null,
    caches: await readCaches(),
    currentUrl: window.location.href,
    secureContext: window.isSecureContext,
    standaloneDisplay: window.matchMedia("(display-mode: standalone)").matches,
  };
}

export function PwaDebugPanel() {
  const status = usePwaStatus();
  const [snapshot, setSnapshot] = useState<ServiceWorkerSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    setSnapshot(await readSnapshot());
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void refresh();

    const handleOnlineChange = () => {
      void refresh();
    };

    window.addEventListener("online", handleOnlineChange);
    window.addEventListener("offline", handleOnlineChange);

    return () => {
      window.removeEventListener("online", handleOnlineChange);
      window.removeEventListener("offline", handleOnlineChange);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Runtime status</h2>
              <p className="text-sm text-muted-foreground">
                Read this directly on the affected device to see whether the
                offline shell is actually installed and controlling the app.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => void refresh()}>
              <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh status
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DebugRow
              label="Browser online"
              value={navigator.onLine ? "Yes" : "No"}
            />
            <DebugRow
              label="Secure context"
              value={snapshot.secureContext ? "Yes" : "No"}
            />
            <DebugRow
              label="Service worker registered"
              value={status.isRegistered ? "Yes" : "No"}
            />
            <DebugRow
              label="Controlling this tab"
              value={status.isControlled ? "Yes" : "No"}
            />
            <DebugRow
              label="Standalone display"
              value={snapshot.standaloneDisplay ? "Yes" : "No"}
            />
            <DebugRow
              label="Shell cache ready"
              value={status.offlineCacheStatus.shellReady ? "Yes" : "No"}
            />
            <DebugRow
              label="Home cached"
              value={status.offlineCacheStatus.homeReady ? "Yes" : "No"}
            />
            <DebugRow
              label="Offline page cached"
              value={status.offlineCacheStatus.offlineReady ? "Yes" : "No"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Service worker details</h2>
          <div className="space-y-3">
            <DebugRow
              label="Current URL"
              value={snapshot.currentUrl ?? "Unavailable"}
            />
            <DebugRow
              label="Registration scope"
              value={snapshot.registrationScope ?? "Unavailable"}
            />
            <DebugRow
              label="Controller script"
              value={snapshot.controllerScriptUrl ?? "None"}
            />
            <DebugRow
              label="Active worker"
              value={snapshot.activeScriptUrl ?? "None"}
            />
            <DebugRow
              label="Waiting worker"
              value={snapshot.waitingScriptUrl ?? "None"}
            />
            <DebugRow
              label="Installing worker"
              value={snapshot.installingScriptUrl ?? "None"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {navigator.onLine ? (
              <Wifi className="h-4 w-4 text-primary" />
            ) : (
              <WifiOff className="h-4 w-4 text-primary" />
            )}
            <h2 className="text-lg font-semibold">Cache storage</h2>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading cache state...</p>
          ) : snapshot.caches.length ? (
            <div className="space-y-4">
              {snapshot.caches.map((cache) => (
                <div
                  key={cache.name}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <p className="font-medium">{cache.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cache.entries.length} cached request
                    {cache.entries.length === 1 ? "" : "s"}
                  </p>
                  <div className="mt-3 space-y-2">
                    {cache.entries.length ? (
                      cache.entries.map((entry) => (
                        <p
                          key={`${cache.name}-${entry}`}
                          className="break-all rounded-lg bg-background/70 px-3 py-2 font-mono text-xs text-muted-foreground"
                        >
                          {entry}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This cache is empty.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No Cache Storage entries were found for this browser session.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
