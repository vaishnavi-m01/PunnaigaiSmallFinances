import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

class PushNotificationManager {
  private channelId: string = 'default';

  async setup() {
    try {
     
      if (notifee && typeof notifee.requestPermission === 'function') {
        await notifee.requestPermission();
      }

      // Create a channel (required for Android)
      if (notifee && typeof notifee.createChannel === 'function') {
        this.channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });
      }

      // Foreground message handler
      try {
        const messaging = getMessaging();
        onMessage(messaging, this.onMessageReceived);
      } catch (e) {
        console.warn('Firebase Messaging not ready for foreground:', e);
      }

      // Notifee Foreground Event handler
      if (notifee && typeof notifee.onForegroundEvent === 'function') {
        notifee.onForegroundEvent(({ type, detail }) => {
          switch (type) {
            case EventType.DISMISSED:
              console.log('User dismissed notification', detail.notification);
              break;
            case EventType.PRESS:
              console.log('User pressed notification', detail.notification);
              break;
          }
        });
      }
    } catch (error) {
      console.warn('Failed to setup Push Notifications. Rebuild the app.', error);
    }
  }

  private onMessageReceived = async (message: any) => {
    console.log('[FCM] Foreground Message Received:', message);

    // Display local notification via Notifee
    await notifee.displayNotification({
      title: message.notification?.title || message.data?.title || 'New Notification',
      body: message.notification?.body || message.data?.body || 'You have a new message.',
      android: {
        channelId: this.channelId,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher', 
        pressAction: {
          id: 'default',
        },
      },
    });
  };
}

export const pushNotificationManager = new PushNotificationManager();
