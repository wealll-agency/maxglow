importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDa9P9ynNmUfZUqCTCrDuj4mG_uQioRmiw",
  authDomain: "maxglow-b2821.firebaseapp.com",
  projectId: "maxglow-b2821",
  storageBucket: "maxglow-b2821.firebasestorage.app",
  messagingSenderId: "954389476058",
  appId: "1:954389476058:web:cb69f0095e292271e36be3"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'MaxGlow Admin Alert';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/icon_organic.jpg',
    badge: '/icon_organic.jpg',
    data: {
      url: payload.fcmOptions?.link || payload.data?.url || '/admin'
    },
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Focus existing tab if open
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
