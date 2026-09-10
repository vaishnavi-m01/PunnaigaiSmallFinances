import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { InvestorTabParamList } from '../../types/navigation';
 import { ROUTES } from '../../constants/routes';
import { InvestorDashboardScreen } from '../../screens/Investor/InvestorDashboardScreen';
import { InvestorWalletScreen } from '../../screens/Investor/InvestorWalletScreen';
import { InvestorProfileScreen } from '../../screens/Investor/InvestorProfileScreen';
import { AppIcon } from '../../component/AppIcon';
import { CustomTabBar } from '../../component/Common/CustomTabBar';

const Tab = createBottomTabNavigator<InvestorTabParamList>();

export const InvestorTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={ROUTES.INVESTOR_DASHBOARD}
        component={InvestorDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="home" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.MY_INVESTMENT}
        component={InvestorDashboardScreen}
        options={{
          tabBarLabel: 'Investment',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="trending-up" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.INVESTOR_WALLET}
        component={InvestorWalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="wallet" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.INVESTOR_PROFILE}
        component={InvestorProfileScreen}
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
