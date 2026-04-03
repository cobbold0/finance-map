export type BrowserNotificationPermission =
  | NotificationPermission
  | "unsupported";

export interface AppNotificationPayload {
  title: string;
  body?: string;
  tag?: string;
  url?: string;
  icon?: string;
  badge?: string;
  requireInteraction?: boolean;
}

export interface PwaStatusSnapshot {
  isSupported: boolean;
  isRegistrationEnabled: boolean;
  isRegistered: boolean;
  permission: BrowserNotificationPermission;
}

const defaultSnapshot: PwaStatusSnapshot = {
  isSupported: false,
  isRegistrationEnabled: false,
  isRegistered: false,
  permission: "default",
};

let snapshot: PwaStatusSnapshot = defaultSnapshot;
const listeners = new Set<() => void>();

function emitSnapshot(nextSnapshot: PwaStatusSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function patchSnapshot(partial: Partial<PwaStatusSnapshot>) {
  emitSnapshot({
    ...snapshot,
    ...partial,
  });
}

export function subscribeToPwaStatus(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getPwaStatusSnapshot() {
  return snapshot;
}

export function getPwaStatusServerSnapshot() {
  return defaultSnapshot;
}

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function syncPwaPermission() {
  patchSnapshot({
    permission: getBrowserNotificationPermission(),
  });
}

export function isPwaRegistrationEnabled() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_ENABLE_PWA_DEV === "true"
  );
}

export async function initializePwa() {
  if (typeof window === "undefined") {
    return snapshot;
  }

  const isSupported = "serviceWorker" in navigator;
  const isRegistrationEnabled = isPwaRegistrationEnabled();

  patchSnapshot({
    isSupported,
    isRegistrationEnabled,
    permission: getBrowserNotificationPermission(),
  });

  if (!isSupported || !isRegistrationEnabled) {
    return snapshot;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    patchSnapshot({ isRegistered: true });
  } catch {
    patchSnapshot({ isRegistered: false });
  }

  return snapshot;
}

export async function requestBrowserNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    patchSnapshot({ permission: "unsupported" });
    return "unsupported" as const;
  }

  const permission = await Notification.requestPermission();
  patchSnapshot({ permission });
  return permission;
}

export async function sendBrowserNotification(
  payload: AppNotificationPayload,
) {
  if (typeof window === "undefined") {
    return false;
  }

  const permission = getBrowserNotificationPermission();

  if (permission !== "granted") {
    patchSnapshot({ permission });
    return false;
  }

  if ("serviceWorker" in navigator) {
    try {
      const registration =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.ready);

      if (registration?.active) {
        registration.active.postMessage({
          type: "SHOW_NOTIFICATION",
          notification: payload,
        });
        return true;
      }
    } catch {
      return false;
    }
  }

  new Notification(payload.title, {
    body: payload.body,
    tag: payload.tag,
  });

  return true;
}
