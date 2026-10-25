const APP_ICON = "/icons/icon-192.png";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let message = {};
  try {
    const payload = event.data?.json() || {};
    message = payload.data ? { ...payload.data, ...payload.notification } : payload;
  } catch { message = { body: event.data?.text() || "You have a reminder." }; }
  const title = message.title || "AsthmaGuard";
  const page = message.page || "Symptom & Medication Log";
  event.waitUntil(self.registration.showNotification(title, {
    body: message.body || "You have a reminder.",
    icon: APP_ICON,
    badge: APP_ICON,
    tag: `asthmaguard-${page}`,
    data: { page },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const page = event.notification.data?.page || "Symptom & Medication Log";
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if ("focus" in client) {
        await client.focus();
        client.postMessage({ type: "OPEN_REMINDER", page });
        return;
      }
    }
    const reminder = page === "Take a Measurement" ? "measurement" : page;
    await self.clients.openWindow(`/?reminder=${encodeURIComponent(reminder)}`);
  })());
});
