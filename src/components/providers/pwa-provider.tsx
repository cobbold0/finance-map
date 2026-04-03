"use client";

import { useEffect } from "react";
import { initializePwa, syncPwaPermission } from "@/lib/pwa";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void initializePwa();

    const syncPermission = () => {
      syncPwaPermission();
    };

    window.addEventListener("focus", syncPermission);
    document.addEventListener("visibilitychange", syncPermission);

    return () => {
      window.removeEventListener("focus", syncPermission);
      document.removeEventListener("visibilitychange", syncPermission);
    };
  }, []);

  return children;
}
