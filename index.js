/**
 * @format
 */

import '@react-native-firebase/app'; 
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

try {
  // Handle background messages using Firebase
  try {
    const messaging = getMessaging();
    setBackgroundMessageHandler(messaging, async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  } catch (e) {
    console.warn('Firebase Messaging not ready:', e);
  }

  // Handle background events using Notifee
  if (notifee && typeof notifee.onBackgroundEvent === 'function') {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail;
      console.log('Notifee background event:', type, notification);
    });
  }
} catch (error) {
  console.warn('Failed to initialize background handlers. Rebuild the app.', error);
}

AppRegistry.registerComponent(appName, () => App);
