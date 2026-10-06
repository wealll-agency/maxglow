importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCcP0Cd5QFq6j7ZiJTZi6gUNv9Ae1mWwCo",
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
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // Add icon in your public folder for logo
    icon: '/icon_organic.jpg' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
