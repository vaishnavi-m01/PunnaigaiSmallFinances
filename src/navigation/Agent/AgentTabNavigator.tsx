import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AgentTabParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';
import { AgentDashboardScreen } from '../../screens/Agent/AgentDashboardScreen';
import { AssignedCustomersScreen } from '../../screens/Agent/AssignedCustomersScreen';
import { AddCollectionScreen } from '../../screens/Agent/AddCollectionScreen';
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
        name={ROUTES.ADD_COLLECTION}
        component={AddCollectionScreen}
        options={{
          tabBarLabel: 'Collection',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="credit-card" size={size || 20} color={color} />
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
