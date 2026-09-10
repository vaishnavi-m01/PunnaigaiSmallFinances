import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../hooks/useAppHooks';
import { APP_ROLES, isValidAppRole } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { useAppTheme } from '../theme/useAppTheme';
import { logout } from '../store/authSlice';

// Auth Screens
import { LoginScreen } from '../screens/common/LoginScreen';
import { OtpVerificationScreen } from '../screens/common/OtpVerificationScreen';
import { SplashScreen } from '../screens/common/SplashScreen';

// Role Stack Navigators
import { CustomerStackNavigator } from './Customer/CustomerStackNavigator';
import { AgentStackNavigator } from './Agent/AgentStackNavigator';
import { InvestorStackNavigator } from './Investor/InvestorStackNavigator';
import { PartnerStackNavigator } from './Partner/PartnerStackNavigator';

// Shared Common Screens
import { MyLoanScreen } from '../screens/Customer/MyLoanScreen';
import { PaymentScheduleScreen } from '../screens/Customer/PaymentScheduleScreen';
import { PaymentHistoryScreen } from '../screens/Customer/PaymentHistoryScreen';
import { PendingAmountScreen } from '../screens/Customer/PendingAmountScreen';
import { OverdueDetailsScreen } from '../screens/Customer/OverdueDetailsScreen';
import { PenaltyDetailsScreen } from '../screens/Customer/PenaltyDetailsScreen';
import { MyDocumentsScreen } from '../screens/Customer/MyDocumentsScreen';
import { NotificationsScreen } from '../screens/Customer/NotificationsScreen';
import { CustomerProfileScreen } from '../screens/Customer/CustomerProfileScreen';
import { AgentProfileScreen } from '../screens/Agent/AgentProfileScreen';
import { InvestorProfileScreen } from '../screens/Investor/InvestorProfileScreen';
import { PartnerProfileScreen } from '../screens/partner/PartnerProfileScreen';
import { AddCollectionScreen } from '../screens/Agent/AddCollectionScreen';
import { AssignedCustomersScreen } from '../screens/Agent/AssignedCustomersScreen';
import { InvestorWalletScreen } from '../screens/Investor/InvestorWalletScreen';
import { InvestorWithdrawScreen } from '../screens/Investor/InvestorWithdrawScreen';
import { PartnerWalletScreen } from '../screens/partner/PartnerWalletScreen';
import { PartnerWithdrawScreen } from '../screens/partner/PartnerWithdrawScreen';
import { ApplyLoanScreen } from '../screens/Customer/ApplyLoanScreen';
import { CustomerDetailViewScreen } from '../screens/Agent/CustomerDetailViewScreen';
import { AgentReportsScreen } from '../screens/Agent/AgentReportsScreen';
import { PartnerEarningsReportScreen } from '../screens/partner/PartnerEarningsReportScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  const currentRole = user?.role || APP_ROLES.CUSTOMER;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Check invalid role protection
  useEffect(() => {
    if (isAuthenticated && user && !isValidAppRole(user.role)) {
      console.warn('[RootNavigator] Invalid role detected. Resetting auth.');
      dispatch(logout());
    }
  }, [isAuthenticated, user, dispatch]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { backgroundColor: colors.surface } : {})}
      />

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
            <Stack.Screen
              name={ROUTES.OTP_VERIFY}
              component={OtpVerificationScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            {/* Role-Specific Navigators */}
            {currentRole === APP_ROLES.CUSTOMER && (
              <Stack.Screen name={ROUTES.CUSTOMER_ROOT} component={CustomerStackNavigator} />
            )}

            {currentRole === APP_ROLES.AGENT && (
              <Stack.Screen name={ROUTES.AGENT_ROOT} component={AgentStackNavigator} />
            )}

            {currentRole === APP_ROLES.INVESTOR && (
              <Stack.Screen name={ROUTES.INVESTOR_ROOT} component={InvestorStackNavigator} />
            )}

            {currentRole === APP_ROLES.PARTNERSHIP && (
              <Stack.Screen name={ROUTES.PARTNER_ROOT} component={PartnerStackNavigator} />
            )}

            {/* Shared Global Stack Screens */}
            <Stack.Screen
              name={ROUTES.MY_LOAN}
              component={MyLoanScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.PAYMENT_SCHEDULE}
              component={PaymentScheduleScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.PAYMENT_HISTORY}
              component={PaymentHistoryScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.PENDING_AMOUNT}
              component={PendingAmountScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.OVERDUE_DETAILS}
              component={OverdueDetailsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.PENALTY_DETAILS}
              component={PenaltyDetailsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.MY_DOCUMENTS}
              component={MyDocumentsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.CUSTOMER_NOTIFICATIONS}
              component={NotificationsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.CUSTOMER_PROFILE}
              component={CustomerProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.AGENT_PROFILE}
              component={AgentProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.INVESTOR_PROFILE}
              component={InvestorProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.PARTNER_PROFILE}
              component={PartnerProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.ADD_COLLECTION}
              component={AddCollectionScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.ASSIGNED_CUSTOMERS}
              component={AssignedCustomersScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.INVESTOR_WALLET}
              component={InvestorWalletScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.INVESTOR_WITHDRAW}
              component={InvestorWithdrawScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.PARTNER_WALLET}
              component={PartnerWalletScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.PARTNER_WITHDRAW}
              component={PartnerWithdrawScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.APPLY_LOAN}
              component={ApplyLoanScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.CUSTOMER_DETAIL_VIEW}
              component={CustomerDetailViewScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.AGENT_REPORTS}
              component={AgentReportsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.PARTNER_EARNINGS_REPORT}
              component={PartnerEarningsReportScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
