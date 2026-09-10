import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgentStackParamList } from '../../types/navigation';
import { ROUTES } from '../../constants/routes';
import { APP_ROLES } from '../../constants/roles';
import { withRoleAccess } from '../../hoc/withRoleAccess';
import { AgentTabNavigator } from './AgentTabNavigator';
import { AddCollectionScreen } from '../../screens/Agent/AddCollectionScreen';
import { CustomerDetailViewScreen } from '../../screens/Agent/CustomerDetailViewScreen';
import { AgentReportsScreen } from '../../screens/Agent/AgentReportsScreen';
import { NotificationsScreen } from '../../screens/Customer/NotificationsScreen';

const Stack = createNativeStackNavigator<AgentStackParamList>();

function AgentStackNavigatorBase() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={ROUTES.AGENT_TABS} component={AgentTabNavigator} />
      <Stack.Screen name={ROUTES.CUSTOMER_DETAIL_VIEW} component={CustomerDetailViewScreen} />
      <Stack.Screen name={ROUTES.ADD_COLLECTION} component={AddCollectionScreen} />
      <Stack.Screen name={ROUTES.AGENT_REPORTS} component={AgentReportsScreen} />
      <Stack.Screen name={ROUTES.AGENT_NOTIFICATIONS} component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

export const AgentStackNavigator = withRoleAccess(AgentStackNavigatorBase, [
  APP_ROLES.AGENT,
]);
