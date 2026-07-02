import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { authApi } from '../api/apiService';

export const requestUserPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      try {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'Allow Movers to send you job alerts, bid updates, and chat notifications.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        return res === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('POST_NOTIFICATIONS permission request error:', err);
        return false;
      }
    }
    return true;
  } else {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    } catch (err) {
      console.warn('FCM requestPermission error:', err);
      return false;
    }
  }
};

export const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

export const registerFcmTokenWithBackend = async () => {
  const hasPermission = await requestUserPermission();
  if (!hasPermission) {
    console.log('FCM Notification permission not granted');
    return;
  }
  const token = await getFcmToken();
  if (token) {
    try {
      await authApi.updateFcmToken(token);
      console.log('FCM Token registered with backend successfully');
    } catch (error) {
      console.error('Failed to register FCM Token with backend:', error.message);
    }
  }
};

export const displayLocalNotification = async (title, body, data = {}) => {
  try {
    // Create default channel for Android
    const channelId = await notifee.createChannel({
      id: 'default_notifications',
      name: 'Default Notifications',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: title || 'Notification',
      body: body || '',
      data: data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (err) {
    console.error('Error displaying local notification via Notifee:', err);
  }
};

export const setupNotificationListeners = () => {
  // Foreground notifications message handler
  const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    console.log('Foreground Message received:', remoteMessage);
    const title = remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification';
    const body = remoteMessage.notification?.body || remoteMessage.data?.body || '';
    
    // Display local notification using Notifee instead of Alert.alert
    await displayLocalNotification(title, body, remoteMessage.data);
  });

  // When notification is clicked in background and opens the app
  const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(
    remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
    }
  );

  // When notification is clicked and opens app from quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
      }
    });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnNotificationOpenedApp();
  };
};
