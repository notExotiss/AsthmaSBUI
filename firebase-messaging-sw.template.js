importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

firebase.initializeApp(__FIREBASE_CONFIG__);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || payload.notification?.title || "AsthmaGuard";
  const body = data.body || payload.notification?.body || "You have a reminder.";
  return self.registration.showNotification(title, {
    body,
    tag: `asthmaguard-${data.page || "reminder"}`,
    data: { page: data.page || "check-in" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const page = event.notification.data?.page || "check-in";
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clientsList) {
      if ("focus" in client) {
        await client.focus();
        client.postMessage({ type: "OPEN_REMINDER", page });
        return;
      }
    }
    await self.clients.openWindow(`/?reminder=${encodeURIComponent(page)}`);
  })());
});
