import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD_yHlmj-Wp7hnEqLfqd8KWuRZLD1e_Bdg",
  authDomain: "maxglow-de636.firebaseapp.com",
  projectId: "maxglow-de636",
  storageBucket: "maxglow-de636.firebasestorage.app",
  messagingSenderId: "103737306324",
  appId: "1:103737306324:web:c2a83c54ac11eb13a6df41",
  measurementId: "G-7S6PH8RVL7"
};

const app = initializeApp(firebaseConfig);

// Messaging is only supported in browsers that support Service Workers and Push API
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging Error:", error);
  }
}

export const generateToken = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // NOTE: For a real production app, pass the VAPID key below to getToken()
      // const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
      const currentToken = await getToken(messaging);
      return currentToken;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });

export default app;
