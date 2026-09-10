import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomerTabParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';
import { CustomerDashboardScreen } from '../../screens/Customer/CustomerDashboardScreen';
import { MyLoanScreen } from '../../screens/Customer/MyLoanScreen';
import { PaymentScheduleScreen } from '../../screens/Customer/PaymentScheduleScreen';
import { CustomerProfileScreen } from '../../screens/Customer/CustomerProfileScreen';
import { AppIcon } from '../../component/AppIcon';
import { CustomTabBar } from '../../component/Common/CustomTabBar';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export const CustomerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={ROUTES.CUSTOMER_DASHBOARD}
        component={CustomerDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="home" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.MY_LOAN}
        component={MyLoanScreen}
        options={{
          tabBarLabel: 'My Loan',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="file-text" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.PAYMENT_SCHEDULE}
        component={PaymentScheduleScreen}
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="credit-card" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.CUSTOMER_PROFILE}
        component={CustomerProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="user" size={size || 20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
