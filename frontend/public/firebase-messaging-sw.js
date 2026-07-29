importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD_yHlmj-Wp7hnEqLfqd8KWuRZLD1e_Bdg",
  authDomain: "maxglow-de636.firebaseapp.com",
  projectId: "maxglow-de636",
  storageBucket: "maxglow-de636.firebasestorage.app",
  messagingSenderId: "103737306324",
  appId: "1:103737306324:web:c2a83c54ac11eb13a6df41",
  measurementId: "G-7S6PH8RVL7"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || "MaxGlow Update";
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
