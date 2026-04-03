export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="max-w-sm space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Offline
        </p>
        <h1 className="text-3xl font-semibold">You are offline right now.</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Some information may still be available while you are offline.
          Reconnect to load the latest balances, reports, and activity.
        </p>
      </div>
    </main>
  );
}
