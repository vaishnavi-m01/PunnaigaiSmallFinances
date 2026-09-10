import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PartnerTabParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';
import { PartnerDashboardScreen } from '../../screens/partner/PartnerDashboardScreen';
import { PartnerEarningsReportScreen } from '../../screens/partner/PartnerEarningsReportScreen';
import { PartnerWalletScreen } from '../../screens/partner/PartnerWalletScreen';
import { PartnerProfileScreen } from '../../screens/partner/PartnerProfileScreen';
import { AppIcon } from '../../component/AppIcon';
import { CustomTabBar } from '../../component/Common/CustomTabBar';

const Tab = createBottomTabNavigator<PartnerTabParamList>();

export const PartnerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={ROUTES.PARTNER_DASHBOARD}
        component={PartnerDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="home" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.MY_EARNINGS}
        component={PartnerEarningsReportScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="pie-chart" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.PARTNER_WALLET}
        component={PartnerWalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="wallet" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.PARTNER_PROFILE}
        component={PartnerProfileScreen}
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
