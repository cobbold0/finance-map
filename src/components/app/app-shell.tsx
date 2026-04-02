import { DesktopSidebar, MobileBottomNav, QuickActionsFab } from "@/components/app/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <DesktopSidebar />
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 pb-32 pt-4 md:px-6 md:pb-10 md:pt-6 lg:px-10">
            {children}
          </main>
          <MobileBottomNav />
          <QuickActionsFab />
        </div>
      </div>
    </div>
  );
}
