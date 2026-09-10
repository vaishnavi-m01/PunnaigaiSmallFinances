import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PartnerStackParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';
import { APP_ROLES } from '../../constants/roles';
import { withRoleAccess } from '../../hoc/withRoleAccess';
import { PartnerTabNavigator } from './PartnerTabNavigator';
import { PartnerWalletScreen } from '../../screens/partner/PartnerWalletScreen';
import { PartnerWithdrawScreen } from '../../screens/partner/PartnerWithdrawScreen';
import { PartnerEarningsReportScreen } from '../../screens/partner/PartnerEarningsReportScreen';
import { NotificationsScreen } from '../../screens/Customer/NotificationsScreen';

const Stack = createNativeStackNavigator<PartnerStackParamList>();

function PartnerStackNavigatorBase() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={ROUTES.PARTNER_TABS} component={PartnerTabNavigator} />
      <Stack.Screen name={ROUTES.PARTNER_EARNINGS_REPORT} component={PartnerEarningsReportScreen} />
      <Stack.Screen name={ROUTES.PARTNER_WALLET} component={PartnerWalletScreen} />
      <Stack.Screen name={ROUTES.PARTNER_WITHDRAW} component={PartnerWithdrawScreen} />
      <Stack.Screen name={ROUTES.PARTNER_NOTIFICATIONS} component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

export const PartnerStackNavigator = withRoleAccess(PartnerStackNavigatorBase, [
  APP_ROLES.PARTNERSHIP,
]);
