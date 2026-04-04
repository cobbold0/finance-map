import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("Offline", "Offline mode.");

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="max-w-sm space-y-3">
        <h1 className="text-3xl font-semibold">Offline</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Some information is still available. Reconnect for the latest data.
        </p>
      </div>
    </main>
  );
}
