import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AgentTabParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';
import { AgentDashboardScreen } from '../../screens/Agent/AgentDashboardScreen';
import { AssignedCustomersScreen } from '../../screens/Agent/AssignedCustomersScreen';
import { CollectionHistoryScreen } from '../../screens/Agent/CollectionHistoryScreen';
import { AgentProfileScreen } from '../../screens/Agent/AgentProfileScreen';
import { AppIcon } from '../../component/AppIcon';
import { CustomTabBar } from '../../component/Common/CustomTabBar';

const Tab = createBottomTabNavigator<AgentTabParamList>();

export const AgentTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={ROUTES.AGENT_DASHBOARD}
        component={AgentDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="home" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.ASSIGNED_CUSTOMERS}
        component={AssignedCustomersScreen}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="users" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.COLLECTION_HISTORY}
        component={CollectionHistoryScreen}
        options={{
          tabBarLabel: 'Collections',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="layers" size={size || 20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.AGENT_PROFILE}
        component={AgentProfileScreen}
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
