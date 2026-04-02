"use client";

import { create } from "zustand";

type DateRange = "30d" | "90d" | "12m";

interface UiState {
  quickActionsOpen: boolean;
  installPromptVisible: boolean;
  notificationPromptVisible: boolean;
  reportRange: DateRange;
  openQuickActions: () => void;
  closeQuickActions: () => void;
  setInstallPromptVisible: (value: boolean) => void;
  setNotificationPromptVisible: (value: boolean) => void;
  setReportRange: (value: DateRange) => void;
}

export const useUiStore = create<UiState>((set) => ({
  quickActionsOpen: false,
  installPromptVisible: true,
  notificationPromptVisible: true,
  reportRange: "90d",
  openQuickActions: () => set({ quickActionsOpen: true }),
  closeQuickActions: () => set({ quickActionsOpen: false }),
  setInstallPromptVisible: (value) => set({ installPromptVisible: value }),
  setNotificationPromptVisible: (value) =>
    set({ notificationPromptVisible: value }),
  setReportRange: (value) => set({ reportRange: value }),
}));
