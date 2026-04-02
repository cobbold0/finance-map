export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="max-w-sm space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Offline
        </p>
        <h1 className="text-3xl font-semibold">You are offline right now.</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Finance Map can still show the app shell while your connection is away.
          Reconnect to sync balances, reports, and recent activity.
        </p>
      </div>
    </main>
  );
}
