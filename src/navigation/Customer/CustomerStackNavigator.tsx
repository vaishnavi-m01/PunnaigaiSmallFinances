import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';
import { APP_ROLES } from '../../constants/roles';
import { withRoleAccess } from '../../hoc/withRoleAccess';
import { CustomerTabNavigator } from './CustomerTabNavigator';
import { ApplyLoanScreen } from '../../screens/Customer/ApplyLoanScreen';
import { MyLoanScreen } from '../../screens/Customer/MyLoanScreen';
import { PaymentScheduleScreen } from '../../screens/Customer/PaymentScheduleScreen';
import { PaymentHistoryScreen } from '../../screens/Customer/PaymentHistoryScreen';
import { PendingAmountScreen } from '../../screens/Customer/PendingAmountScreen';
import { OverdueDetailsScreen } from '../../screens/Customer/OverdueDetailsScreen';
import { PenaltyDetailsScreen } from '../../screens/Customer/PenaltyDetailsScreen';
import { MyDocumentsScreen } from '../../screens/Customer/MyDocumentsScreen';
import { NotificationsScreen } from '../../screens/Customer/NotificationsScreen';
import { CustomerProfileScreen } from '../../screens/Customer/CustomerProfileScreen';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

function CustomerStackNavigatorBase() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.CUSTOMER_TABS} component={CustomerTabNavigator} />
      <Stack.Screen name={ROUTES.APPLY_LOAN} component={ApplyLoanScreen} />
      <Stack.Screen name={ROUTES.MY_LOAN} component={MyLoanScreen} />
      <Stack.Screen name={ROUTES.PAYMENT_SCHEDULE} component={PaymentScheduleScreen} />
      <Stack.Screen name={ROUTES.PAYMENT_HISTORY} component={PaymentHistoryScreen} />
      <Stack.Screen name={ROUTES.PENDING_AMOUNT} component={PendingAmountScreen} />
      <Stack.Screen name={ROUTES.OVERDUE_DETAILS} component={OverdueDetailsScreen} />
      <Stack.Screen name={ROUTES.PENALTY_DETAILS} component={PenaltyDetailsScreen} />
      <Stack.Screen name={ROUTES.MY_DOCUMENTS} component={MyDocumentsScreen} />
      <Stack.Screen name={ROUTES.CUSTOMER_NOTIFICATIONS} component={NotificationsScreen} />
      <Stack.Screen name={ROUTES.CUSTOMER_PROFILE} component={CustomerProfileScreen} />
    </Stack.Navigator>
  );
}

export const CustomerStackNavigator = withRoleAccess(CustomerStackNavigatorBase, [
  APP_ROLES.CUSTOMER,
]);
