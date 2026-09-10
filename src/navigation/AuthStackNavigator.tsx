import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { SplashScreen } from '../screens/common/SplashScreen';
import { LoginScreen } from '../screens/common/LoginScreen';
import { OtpVerificationScreen } from '../screens/common/OtpVerificationScreen';

const Stack = createNativeStackNavigator();

export const AuthStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.SPLASH}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.OTP_VERIFY} component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
};
