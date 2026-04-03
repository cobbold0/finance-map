"use client";

import { useSyncExternalStore } from "react";
import {
  getPwaStatusServerSnapshot,
  getPwaStatusSnapshot,
  subscribeToPwaStatus,
} from "@/lib/pwa";

export function usePwaStatus() {
  return useSyncExternalStore(
    subscribeToPwaStatus,
    getPwaStatusSnapshot,
    getPwaStatusServerSnapshot,
  );
}
