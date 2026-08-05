"use client";
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { generateToken, onMessageListener } from '../utils/firebase';
import { useNotification } from '../context/NotificationContext';
import api from '../utils/axiosConfig';

export default function FCMProvider({ children }) {
  const { user } = useSelector(state => state.auth);
  const { showAlert } = useNotification();

  useEffect(() => {
    if (user && user.token) {
      // 1. Request Permission & Get Token
      generateToken().then((fcmToken) => {
        if (fcmToken) {
          // 2. Send token to backend
          api.post('/auth/fcm-token', { token: fcmToken })
            .catch(err => console.error('Failed to register FCM token', err));
        }
      });
    }

    // 3. Listen for foreground notifications
    onMessageListener().then(payload => {
      if (payload && payload.notification) {
        showAlert(`${payload.notification.title}: ${payload.notification.body}`, 'success');
      }
    }).catch(err => console.log('Failed: ', err));

  }, [user, showAlert]);

  return <>{children}</>;
}
