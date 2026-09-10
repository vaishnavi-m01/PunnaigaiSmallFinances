import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InvestorStackParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';
import { APP_ROLES } from '../../constants/roles';
import { withRoleAccess } from '../../hoc/withRoleAccess';
import { InvestorTabNavigator } from './InvestorTabNavigator';
import { InvestorWalletScreen } from '../../screens/Investor/InvestorWalletScreen';
import { InvestorWithdrawScreen } from '../../screens/Investor/InvestorWithdrawScreen';
import { NotificationsScreen } from '../../screens/Customer/NotificationsScreen';

const Stack = createNativeStackNavigator<InvestorStackParamList>();

function InvestorStackNavigatorBase() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={ROUTES.INVESTOR_TABS} component={InvestorTabNavigator} />
      <Stack.Screen name={ROUTES.INVESTOR_WALLET} component={InvestorWalletScreen} />
      <Stack.Screen name={ROUTES.INVESTOR_WITHDRAW} component={InvestorWithdrawScreen} />
      <Stack.Screen name={ROUTES.INVESTOR_NOTIFICATIONS} component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

export const InvestorStackNavigator = withRoleAccess(InvestorStackNavigatorBase, [
  APP_ROLES.INVESTOR,
]);
