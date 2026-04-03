const APP_CACHE = "finance-map-app-v3";
const RUNTIME_CACHE = "finance-map-runtime-v3";
const APP_SHELL_ROUTES = ["/", "/offline", "/manifest.webmanifest", "/icon"];

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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ROUTES))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
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

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, copy))
            .catch(() => undefined);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);

          if (cached) {
            return cached;
          }

          return (
            (await caches.match("/offline")) ||
            new Response("Offline", { status: 503 })
          );
        }),
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/icon" ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => undefined);
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      }),
    );
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
