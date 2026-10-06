import '../config/firebase.js'; // Ensure initialization
import { getMessaging } from 'firebase-admin/messaging';
import { getApps } from 'firebase-admin/app';
import User from '../models/User.js';

export const sendAdminNotification = async (title, body, url = '/admin') => {
  try {
    if (getApps().length === 0) return; // Firebase not initialized

    const admins = await User.find({ role: { $in: ['Super Admin', 'Manager'] } });
    const tokens = admins.reduce((acc, user) => {
      if (user.fcmTokens && user.fcmTokens.length > 0) {
        acc.push(...user.fcmTokens);
      }
      return acc;
    }, []);

    if (tokens.length === 0) return;

    const message = {
      notification: { title, body },
      webpush: {
        fcmOptions: { link: url }
      },
      tokens
    };

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(`Push notification sent. Success: ${response.successCount}, Failures: ${response.failureCount}`);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
