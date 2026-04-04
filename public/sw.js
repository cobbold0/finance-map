const SHELL_CACHE = "finance-map-shell-v4";
const PAGE_CACHE = "finance-map-pages-v4";
const STATIC_CACHE = "finance-map-static-v4";
const CACHE_NAMES = [SHELL_CACHE, PAGE_CACHE, STATIC_CACHE];
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/welcome",
  "/manifest.webmanifest",
  "/icon",
  "/icons/192",
  "/icons/512",
  "/welcome/home-overview.png",
  "/welcome/reports-trend.png",
  "/welcome/settings-screen.png",
  "/welcome/wallet-summary.png",
];

function isCacheableResponse(response) {
  return Boolean(response) && response.ok && response.type !== "error";
}

function buildNotificationOptions(notification) {
  return {
    body: notification.body,
    icon: notification.icon || "/icon",
    badge: notification.badge || "/icon",
    tag: notification.tag,
    data: {
      url: notification.url || "/notifications",
    },
    requireInteraction: Boolean(notification.requireInteraction),
  };
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length <= maxEntries) {
    return;
  }

  await Promise.all(
    keys.slice(0, keys.length - maxEntries).map((request) => cache.delete(request)),
  );
}

async function putInCache(cacheName, request, response) {
  if (!isCacheableResponse(response)) {
    return response;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());

  if (cacheName === PAGE_CACHE) {
    await trimCache(PAGE_CACHE, 30);
  }

  if (cacheName === STATIC_CACHE) {
    await trimCache(STATIC_CACHE, 80);
  }

  return response;
}

async function handleNavigationRequest(event) {
  const { request } = event;
  const preloadResponse = await event.preloadResponse;

  if (isCacheableResponse(preloadResponse)) {
    await putInCache(PAGE_CACHE, request, preloadResponse);
    return preloadResponse;
  }

  try {
    const networkResponse = await fetch(request);
    await putInCache(PAGE_CACHE, request, networkResponse);
    return networkResponse;
  } catch {
    const cachedPage = await caches.match(request);

    if (cachedPage) {
      return cachedPage;
    }

    const cachedHome = await caches.match("/");

    if (cachedHome) {
      return cachedHome;
    }

    return (
      (await caches.match("/offline")) ||
      new Response("Offline", { status: 503 })
    );
  }
}

async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  const networkFetch = fetch(request)
    .then((response) => putInCache(STATIC_CACHE, request, response))
    .catch(() => cached);

  return cached || networkFetch;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => !CACHE_NAMES.includes(key))
          .map((key) => caches.delete(key)),
      );

      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/welcome/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/icon" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp")
  ) {
    event.respondWith(handleStaticRequest(request));
  }
});

self.addEventListener("message", (event) => {
  const payload = event.data;

  if (!payload || typeof payload !== "object") {
    return;
  }

  if (payload.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (payload.type === "SHOW_NOTIFICATION" && payload.notification) {
    const notification = payload.notification;

    event.waitUntil(
      self.registration.showNotification(
        notification.title,
        buildNotificationOptions(notification),
      ),
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = null;

  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "Finance Map alert",
      body: event.data.text(),
      url: "/notifications",
    };
  }

  if (!payload?.title) {
    payload = {
      title: "Finance Map alert",
      body: payload?.body || "You have a new finance reminder.",
      url: payload?.url || "/notifications",
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      payload.title,
      buildNotificationOptions(payload),
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  const targetUrl = event.notification.data?.url || "/notifications";

  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});
