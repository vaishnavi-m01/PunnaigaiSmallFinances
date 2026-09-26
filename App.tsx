import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { navigationRef } from './src/navigation/navigationService';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GlobalToast } from './src/component/GlobalToast';
import { GlobalErrorModal } from './src/component/GlobalErrorModal';
import { pushNotificationManager } from './src/services/PushNotificationManager';
import { LanguageProvider } from './src/context/LanguageContext';

function App() {
  useEffect(() => {
    pushNotificationManager.setup();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          {...(Platform.OS === 'android' ? { backgroundColor: '#FFFFFF' } : {})}
        />
        <NavigationContainer ref={navigationRef}>
          <LanguageProvider>
            <View style={styles.container}>
              <RootNavigator />
              <GlobalToast />
              <GlobalErrorModal />
            </View>
          </LanguageProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

export default App;
