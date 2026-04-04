"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function PageHeaderClient({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncState = () => {
      if (!mediaQuery.matches) {
        setCollapsed(false);
        return;
      }

      setCollapsed(window.scrollY > 24);
    };

    syncState();
    window.addEventListener("scroll", syncState, { passive: true });
    window.addEventListener("resize", syncState);
    mediaQuery.addEventListener("change", syncState);

    return () => {
      window.removeEventListener("scroll", syncState);
      window.removeEventListener("resize", syncState);
      mediaQuery.removeEventListener("change", syncState);
    };
  }, []);

  return (
    <div
      data-page-header
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "sticky top-0 z-20 -mx-4 mb-10 border-b border-white/6 bg-black/75 px-4 py-4 backdrop-blur-xl transition-all duration-200 md:static md:m-0 md:mb-4 md:border-none md:bg-transparent md:px-0 md:py-0",
        collapsed && "py-3",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="page-header-title text-xl font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
          {description ? (
            <p className="page-header-description max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
