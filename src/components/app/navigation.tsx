"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { desktopNav, mobileTabs, quickActions } from "@/config/navigation";
import { LogoMark } from "@/components/app/logo-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="sticky top-0 flex h-screen flex-col gap-6 overflow-hidden border-r border-border bg-[#15181b] px-5 py-6">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-sm font-semibold">Finance Map</p>
            <p className="text-xs text-muted-foreground">Personal finance</p>
          </div>
        </div>
        <nav className="space-y-2">
          {desktopNav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                  active && "bg-secondary text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#15181b] px-3 pb-safe lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-around gap-2 py-3">
        {mobileTabs.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] text-muted-foreground transition",
                active && "text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function QuickActionsFab() {
  const openQuickActions = useUiStore((state) => state.openQuickActions);

  return (
    <>
      <button
        type="button"
        onClick={openQuickActions}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary text-primary-foreground transition hover:brightness-95 lg:hidden"
        aria-label="Open quick actions"
      >
        <Plus className="h-6 w-6" />
      </button>
      <QuickActionsSheet />
    </>
  );
}

function QuickActionsSheet() {
  const isOpen = useUiStore((state) => state.quickActionsOpen);
  const closeQuickActions = useUiStore((state) => state.closeQuickActions);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={closeQuickActions}
        aria-label="Close quick actions"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-md border border-border bg-card p-5">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-xl bg-border" />
        <div className="grid gap-3">
          {quickActions.map((item) => (
            <Button
              key={item.id}
              asChild
              variant="secondary"
              className="justify-start rounded-xl"
            >
              <Link href={item.href} onClick={closeQuickActions}>
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
