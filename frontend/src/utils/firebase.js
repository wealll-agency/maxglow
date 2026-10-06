import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCcP0Cd5QFq6j7ZiJTZi6gUNv9Ae1mWwCo",
  authDomain: "maxglow-b2821.firebaseapp.com",
  projectId: "maxglow-b2821",
  storageBucket: "maxglow-b2821.firebasestorage.app",
  messagingSenderId: "954389476058",
  appId: "1:954389476058:web:cb69f0095e292271e36be3",
  measurementId: "G-SX57KX3GE1"
};

const app = initializeApp(firebaseConfig);

let messaging;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return null;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { 
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
      });
      
      if (currentToken) {
        console.log('Firebase FCM Token Generated successfully!');
        return currentToken;
      }
    }
    return null;
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};

export const onMessageListener = (callback) => {
  if (messaging) {
    onMessage(messaging, (payload) => {
      callback(payload);
    });
  }
};
