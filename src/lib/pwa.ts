import { getPublicSupabaseEnv } from "@/lib/env";
import {
  deletePushSubscriptionAction,
  savePushSubscriptionAction,
} from "@/features/notifications/actions";

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
  isControlled: boolean;
  isPushSupported: boolean;
  isPushConfigured: boolean;
  isSubscribed: boolean;
  permission: BrowserNotificationPermission;
  offlineCacheStatus: {
    shellReady: boolean;
    homeReady: boolean;
    offlineReady: boolean;
  };
}

const defaultSnapshot: PwaStatusSnapshot = {
  isSupported: false,
  isRegistrationEnabled: false,
  isRegistered: false,
  isControlled: false,
  isPushSupported: false,
  isPushConfigured: false,
  isSubscribed: false,
  permission: "default",
  offlineCacheStatus: {
    shellReady: false,
    homeReady: false,
    offlineReady: false,
  },
};

let snapshot: PwaStatusSnapshot = defaultSnapshot;
const listeners = new Set<() => void>();
const FINANCE_MAP_CACHE_PREFIX = "finance-map-";
const SW_CONTROL_RELOAD_KEY = "finance-map-sw-control-reload";

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

function clearServiceWorkerReloadMarker() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(SW_CONTROL_RELOAD_KEY);
}

function ensureServiceWorkerControl() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    navigator.serviceWorker.controller
  ) {
    clearServiceWorkerReloadMarker();
    return;
  }

  if (window.sessionStorage.getItem(SW_CONTROL_RELOAD_KEY) === "pending") {
    return;
  }

  window.sessionStorage.setItem(SW_CONTROL_RELOAD_KEY, "pending");
  window.location.reload();
}

function getVapidPublicKey() {
  return getPublicSupabaseEnv()?.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

async function clearFinanceMapCaches() {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(FINANCE_MAP_CACHE_PREFIX))
      .map((key) => caches.delete(key)),
  );
}

async function readOfflineCacheStatus() {
  if (typeof window === "undefined" || !("caches" in window)) {
    return defaultSnapshot.offlineCacheStatus;
  }

  const keys = await caches.keys();
  const shellCacheName = keys.find((key) => key.startsWith("finance-map-shell-"));

  if (!shellCacheName) {
    return defaultSnapshot.offlineCacheStatus;
  }

  const shellCache = await caches.open(shellCacheName);
  const [home, offline] = await Promise.all([
    shellCache.match("/"),
    shellCache.match("/offline"),
  ]);

  return {
    shellReady: true,
    homeReady: Boolean(home),
    offlineReady: Boolean(offline),
  };
}

async function cleanupServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();

  await Promise.all(registrations.map((registration) => registration.unregister()));
  await clearFinanceMapCaches();
}

function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

async function syncPushSubscriptionStatus(
  registration?: ServiceWorkerRegistration,
) {
  if (!isPushSupported()) {
    patchSnapshot({
      isPushSupported: false,
      isPushConfigured: false,
      isSubscribed: false,
    });
    return null;
  }

  const vapidPublicKey = getVapidPublicKey();
  const activeRegistration =
    registration ||
    (await navigator.serviceWorker.getRegistration()) ||
    (await navigator.serviceWorker.ready);
  const subscription = await activeRegistration.pushManager.getSubscription();

  patchSnapshot({
    isPushSupported: true,
    isPushConfigured: Boolean(vapidPublicKey),
    isSubscribed: Boolean(subscription),
    isControlled: Boolean(navigator.serviceWorker.controller),
    offlineCacheStatus: await readOfflineCacheStatus(),
  });

  return subscription;
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
    isControlled: Boolean(navigator.serviceWorker.controller),
    isPushSupported: isPushSupported(),
    isPushConfigured: Boolean(getVapidPublicKey()),
    permission: getBrowserNotificationPermission(),
    offlineCacheStatus: await readOfflineCacheStatus(),
  });

  if (!isSupported || !isRegistrationEnabled) {
    if (isSupported) {
      await cleanupServiceWorkers();
    }

    patchSnapshot({ isRegistered: false, isSubscribed: false });
    return snapshot;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      clearServiceWorkerReloadMarker();
      patchSnapshot({ isControlled: true });
    });

    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    await navigator.serviceWorker.ready;
    patchSnapshot({
      isRegistered: true,
      isControlled: Boolean(navigator.serviceWorker.controller),
      offlineCacheStatus: await readOfflineCacheStatus(),
    });
    ensureServiceWorkerControl();
    await syncPushSubscriptionStatus(registration);
  } catch {
    patchSnapshot({
      isRegistered: false,
      isControlled: Boolean(navigator.serviceWorker.controller),
      isSubscribed: false,
      offlineCacheStatus: await readOfflineCacheStatus(),
    });
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

  if (permission === "granted") {
    await syncPushSubscriptionStatus();
  }

  return permission;
}

export async function ensurePushSubscription() {
  if (!isPushSupported()) {
    patchSnapshot({
      isPushSupported: false,
      isPushConfigured: false,
      isSubscribed: false,
    });
    return { error: "Push notifications are not supported in this browser." };
  }

  const vapidPublicKey = getVapidPublicKey();

  if (!vapidPublicKey) {
    patchSnapshot({ isPushConfigured: false, isSubscribed: false });
    return { error: "VAPID public key is not configured." };
  }

  const permission = getBrowserNotificationPermission();

  if (permission !== "granted") {
    patchSnapshot({ permission, isSubscribed: false });
    return { error: "Notification permission has not been granted." };
  }

  try {
    const registration =
      (await navigator.serviceWorker.getRegistration()) ||
      (await navigator.serviceWorker.ready);

    const existingSubscription =
      await registration.pushManager.getSubscription();
    const subscription =
      existingSubscription ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      }));

    const payload = subscription.toJSON();
    const result = await savePushSubscriptionAction(payload);

    if (result?.error) {
      patchSnapshot({ isSubscribed: false });
      return { error: result.error };
    }

    patchSnapshot({
      isPushSupported: true,
      isPushConfigured: true,
      isSubscribed: true,
    });

    return { success: true };
  } catch (error) {
    patchSnapshot({ isSubscribed: false });
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to register this browser for push notifications.",
    };
  }
}

export async function removePushSubscription() {
  if (!isPushSupported()) {
    patchSnapshot({ isSubscribed: false });
    return { success: true };
  }

  const registration =
    (await navigator.serviceWorker.getRegistration()) ||
    (await navigator.serviceWorker.ready);
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    patchSnapshot({ isSubscribed: false });
    return { success: true };
  }

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  const result = await deletePushSubscriptionAction(endpoint);

  if (result?.error) {
    return { error: result.error };
  }

  patchSnapshot({ isSubscribed: false });
  return { success: true };
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

      if (registration) {
        await registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/icon",
          badge: payload.badge || "/icon",
          tag: payload.tag,
          data: {
            url: payload.url || "/notifications",
          },
          requireInteraction: Boolean(payload.requireInteraction),
        });
        return true;
      }
    } catch {
      // Fall back to the page-level Notification API below.
    }
  }

  new Notification(payload.title, {
    body: payload.body,
    tag: payload.tag,
  });

  return true;
}
