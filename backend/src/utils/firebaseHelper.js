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

    // Deduplicate tokens across machines
    const uniqueTokens = Array.from(new Set(tokens));

    const message = {
      notification: { title, body },
      data: {
        url: url || '/admin',
        title: title || 'MaxGlow Admin',
        body: body || ''
      },
      webpush: {
        fcmOptions: { link: url },
        headers: {
          Urgency: 'high'
        },
        notification: {
          icon: '/icon_organic.jpg',
          badge: '/icon_organic.jpg',
          requireInteraction: true
        }
      },
      tokens: uniqueTokens
    };

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(`Push notification sent. Success: ${response.successCount}, Failures: ${response.failureCount}`);

    // Clean up stale or invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(uniqueTokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await User.updateMany(
          { fcmTokens: { $in: invalidTokens } },
          { $pull: { fcmTokens: { $in: invalidTokens } } }
        );
      }
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
