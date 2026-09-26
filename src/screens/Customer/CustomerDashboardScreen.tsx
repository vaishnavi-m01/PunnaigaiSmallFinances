import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import {
  fetchDashboardThunk,
  fetchOverdueThunk,
  fetchUnreadCountThunk,
} from '../../store/customerSlice';
import { AppIcon, IconName } from '../../component/AppIcon';
import { ROUTES } from '../../constants/routes';
import { AppNotification } from '../../types/models';
import { formatINR } from '../../utils/currency';
import { Card } from '../../component/Common/Card';
import { CustomButton } from '../../component/Common/CustomButton';
import { Skeleton } from '../../component/Common/Skeleton';
import * as customerApi from '../../services/api/customerApi';
import { formatDate } from '../../utils/date';

export const CustomerDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const unreadCount = useAppSelector(
    state => state.customer.unreadNotificationCount,
  );
  const dashboardData = useAppSelector(state => state.customer.dashboardData);
  const overdueData = useAppSelector(state => state.customer.overdueData);
  const isDashboardLoading = useAppSelector(
    state => state.customer.isDashboardLoading,
  );

  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation Values - declared before useEffect for stable hook order
  const fadeAnimHeader = React.useRef(new Animated.Value(0)).current;
  const slideAnimCards = React.useRef(new Animated.Value(30)).current;
  const opacityAnimCards = React.useRef(new Animated.Value(0)).current;
  const slideAnimActions = React.useRef(new Animated.Value(30)).current;
  const opacityAnimActions = React.useRef(new Animated.Value(0)).current;
  const slideAnimRecent = React.useRef(new Animated.Value(30)).current;
  const opacityAnimRecent = React.useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchDashboardThunk()),
      dispatch(fetchOverdueThunk()),
      dispatch(fetchUnreadCountThunk()),
    ]);
    setIsRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardThunk());
    dispatch(fetchOverdueThunk());
    dispatch(fetchUnreadCountThunk());

    Animated.stagger(150, [
      Animated.timing(fadeAnimHeader, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(opacityAnimCards, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimCards, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(opacityAnimActions, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimActions, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(opacityAnimRecent, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimRecent, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [dispatch]);

  const quickActions: {
    id: string;
    title: string;
    icon: IconName;
    route: string;
  }[] = [
    // {
    //   id: 'packages',
    //   title: 'Loan\nPackages',
    //   icon: 'briefcase',
    //   route: ROUTES.APPLY_LOAN,
    // }
   
    {
      id: 'schedule',
      title: 'Payment\nHistory',
      icon: 'calendar',
      route: ROUTES.PAYMENT_SCHEDULE,
    },
    {
      id: 'overdue',
      title: 'Overdue\nDetails',
      icon: 'grid',
      route: ROUTES.OVERDUE_DETAILS,
    },
     {
      id: 'profile',
      title: 'My\nProfile',
      icon: 'user',
      route: ROUTES.CUSTOMER_PROFILE,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <Animated.View
        style={[
          styles.topHeader,
          { paddingTop: Math.max(insets.top + 6, 16) },
          {
            opacity: fadeAnimHeader,
            transform: [
              {
                translateY: fadeAnimHeader.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {/* User Avatar Circle */}
          <TouchableOpacity
            style={styles.avatarCircle}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.CUSTOMER_PROFILE)}
          >
            <View style={styles.avatarInner}>
              <AppIcon name="user" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Greeting Text */}
          <View style={styles.nameBlock}>
            <Text style={styles.greetingTitle}>
              Hello, {user?.name || 'Customer'}
            </Text>
            <Text style={styles.greetingSubtitle}>Welcome back!</Text>
          </View>
        </View>

        {/* Notification Bell with Red Badge Dot */}
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => navigation.navigate(ROUTES.CUSTOMER_NOTIFICATIONS)}
          activeOpacity={0.7}
        >
          <AppIcon name="bell" size={20} color="#0F172A" />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      >
        {isRefreshing || isDashboardLoading ? (
          <View style={{ paddingTop: 16 }}>
            <Skeleton
              height={200}
              borderRadius={24}
              style={{ marginBottom: 20 }}
            />
            <Skeleton
              height={60}
              borderRadius={16}
              style={{ marginBottom: 24 }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 32,
              }}
            >
              <Skeleton width={60} height={80} borderRadius={12} />
              <Skeleton width={60} height={80} borderRadius={12} />
              <Skeleton width={60} height={80} borderRadius={12} />
              <Skeleton width={60} height={80} borderRadius={12} />
            </View>
            <Skeleton height={30} width={150} style={{ marginBottom: 16 }} />
            <Skeleton
              height={80}
              borderRadius={16}
              style={{ marginBottom: 12 }}
            />
          </View>
        ) : (
          <>
            <Animated.View
              style={{
                paddingTop: 8,
                opacity: opacityAnimCards,
                transform: [{ translateY: slideAnimCards }],
              }}
            >
              {/* 1. Active Finance / Loan Card */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate(ROUTES.MY_LOAN)}
              >
                <LinearGradient
                  colors={['#047857', '#064E3B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeLoanCard}
                >
                {/* Top Row: Amount & View Details Button */}
                <View style={styles.loanCardTop}>
                  <View style={styles.loanInfoLeft}>
                    <View style={styles.activeLoanBadge}>
                      <Text style={styles.activeLoanLabel}>Active Loan</Text>
                    </View>
                    <Text style={styles.loanAmountValue}>
                      {formatINR(
                        dashboardData?.activeLoan?.requestedAmount ??
                          dashboardData?.finance?.totalAmount ??
                          0,
                      )}
                    </Text>
                    <Text style={styles.loanIdText}>
                      {dashboardData?.activeLoan
                        ? `Loan ID: ${dashboardData.activeLoan.id}`
                        : dashboardData?.finance
                        ? `Finance: ${dashboardData.finance.financeCode}`
                        : 'N/A'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewDetailsPill}
                    onPress={() => navigation.navigate(ROUTES.MY_LOAN)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.viewDetailsPillText}>View Details</Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom Row: 2 White Sub-Boxes */}
                <View style={styles.loanMetricsRow}>
                  <TouchableOpacity
                    style={styles.metricWhiteBox}
                    // onPress={() => navigation.navigate(ROUTES.PENDING_AMOUNT)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.metricHeaderRow}>
                      <View style={styles.miniGreenIcon}>
                        <AppIcon name="calendar" size={12} color="#0D523B" />
                      </View>
                      <Text style={styles.metricTitleText}>Balance to Pay</Text>
                    </View>
                    <Text style={styles.metricAmountText}>
                      {formatINR(
                        dashboardData?.finance?.outstandingAmount ?? 0,
                      )}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.metricWhiteBox}
                    onPress={() => navigation.navigate(ROUTES.PAYMENT_SCHEDULE)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.metricHeaderRow}>
                      <View style={styles.miniGreenIcon}>
                        <AppIcon name="trending-up" size={12} color="#0D523B" />
                      </View>
                      <Text style={styles.metricTitleText}>Amount Paid</Text>
                    </View>
                    <Text style={styles.metricAmountText}>
                      {formatINR(dashboardData?.finance?.paidAmount ?? 0)}
                    </Text>
                  </TouchableOpacity>
                </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* 2. Upcoming EMI Due Alert Strip (Only if Overdue) */}
              {overdueData &&
                overdueData.totalDue > 0 &&
                overdueData.overdue.length > 0 && (
                  <TouchableOpacity
                    style={styles.dueAlertCard}
                    onPress={() => navigation.navigate(ROUTES.OVERDUE_DETAILS)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.dueAlertLeft}>
                      <View style={styles.dueAlertIconCircle}>
                        <AppIcon
                          name="alert-triangle"
                          size={15}
                          color="#D97706"
                        />
                      </View>
                      <View style={styles.dueAlertTextCol}>
                        <Text style={styles.dueAlertTitle}>
                          Payment Overdue!
                        </Text>
                        <Text style={styles.dueAlertSub}>
                          {formatINR(overdueData.totalDue)} total dues from{' '}
                          {overdueData.overdue.length} schedule(s)
                        </Text>
                      </View>
                    </View>
                    <AppIcon name="chevron-right" size={20} color="#D97706" />
                  </TouchableOpacity>
                )}
            </Animated.View>

            {/* 3. Premium Gradient Quick Actions Bar */}
            <Animated.View
              style={[
                styles.quickActionsContainer,
                {
                  opacity: opacityAnimActions,
                  transform: [{ translateY: slideAnimActions }],
                },
              ]}
            >
              <Text style={styles.sectionHeading}>Quick Actions</Text>

              <View style={styles.quickActionsPremiumBar}>
                {quickActions.map(action => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.premiumActionCol}
                    onPress={() => navigation.navigate(action.route)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.premiumActionIconCircle}>
                      <AppIcon name={action.icon} size={18} color="#0D523B" />
                    </View>
                    <Text style={styles.premiumActionLabel}>
                      {action.title.replace('\n', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* 4. Recent Transactions Section */}
            <Animated.View
              style={[
                styles.transactionsSection,
                {
                  opacity: opacityAnimRecent,
                  transform: [{ translateY: slideAnimRecent }],
                },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Recent Transactions</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.PAYMENT_SCHEDULE)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View All &gt;</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.transactionListCard}>
                {dashboardData?.recentTransactions &&
                dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions.map((item, index) => {
                    const isLast =
                      index === dashboardData.recentTransactions!.length - 1;
                    return (
                      <React.Fragment key={item.paymentId}>
                        <TouchableOpacity
                          style={styles.transactionItem}
                          onPress={() =>
                            navigation.navigate(ROUTES.PAYMENT_SCHEDULE)
                          }
                          activeOpacity={0.7}
                        >
                          <View style={styles.transactionLeft}>
                            <View style={styles.txIconCircle}>
                              <AppIcon
                                name="calendar"
                                size={15}
                                color="#0D523B"
                              />
                            </View>
                            <View>
                              <Text style={styles.txDateText}>
                                {formatDate(item.paidAt)}
                              </Text>
                              <Text style={styles.txReceiptText}>
                                {item.loanPackageName} •{' '}
                                {item.mode
                                  ? item.mode.charAt(0).toUpperCase() +
                                    item.mode.slice(1)
                                  : ''}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.transactionRight}>
                            <Text style={styles.txAmountText}>
                              {formatINR(item.amount)}
                            </Text>
                            <View
                              style={[
                                styles.txPaidBadge,
                                {
                                  backgroundColor:
                                    item.status.toLowerCase() === 'approved'
                                      ? '#DCFCE7'
                                      : '#FEF3C7',
                                  borderColor:
                                    item.status.toLowerCase() === 'approved'
                                      ? '#86EFAC'
                                      : '#FDE68A',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.txPaidBadgeText,
                                  {
                                    color:
                                      item.status.toLowerCase() === 'approved'
                                        ? '#15803D'
                                        : '#D97706',
                                  },
                                ]}
                              >
                                {item.status.charAt(0).toUpperCase() +
                                  item.status.slice(1)}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {!isLast && <View style={styles.txDivider} />}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <View style={styles.txEmptyBox}>
                    <Text style={styles.txEmptyText}>
                      No recent payments found.
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* 5. Secure Your Future Promotional Banner */}
            <View style={styles.bannerContainer}>
              <Image
                source={require('../../assets/images/HomePageBanner.png')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>

            {/* 7. 24x7 Customer Helpline Support Strip */}
            <TouchableOpacity
              style={styles.supportStrip}
              onPress={() => setSupportModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.supportLeft}>
                <View style={styles.supportIconCircle}>
                  <AppIcon name="help-circle" size={16} color="#0D523B" />
                </View>
                <View>
                  <Text style={styles.supportTitle}>
                    Need Help with your Loan?
                  </Text>
                  <Text style={styles.supportSub}>
                    Toll-free 1800-123-PUNNAIGAI (9 AM - 6 PM)
                  </Text>
                </View>
              </View>
              <AppIcon name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* 8. Trust & RBI Regulatory Footer */}
            <View style={styles.trustFooter}>
              <View style={styles.trustRow}>
                <AppIcon name="shield" size={13} color="#10B981" />
                <Text style={styles.trustText}>
                  RBI Regulated NBFC • 100% Encrypted & Safe
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Support Info Modal */}
      <Modal visible={supportModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>
              Punnaigai Customer Support
            </Text>
            <View style={styles.modalContentBlock}>
              <Text style={styles.modalSubText}>
                📞 Toll-free: 1800-123-PUNNAIGAI (7866)
              </Text>
              <Text style={styles.modalSubText}>
                ✉️ Email: support@punnaigaifinances.com
              </Text>
              <Text style={styles.modalSubText}>
                🕒 Working Hours: Mon - Sat (9:00 AM - 6:00 PM)
              </Text>
              <Text style={styles.modalSubText}>
                📍 Head Office: Punnaigai Financial Tower, Chennai
              </Text>
            </View>

            <CustomButton
              title="Close"
              variant="primary"
              onPress={() => setSupportModalVisible(false)}
              gradientColors={['#168A53', '#0D523B']}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    marginRight: 8,
  },

  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D523B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D523B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameBlock: {
    justifyContent: 'center',
  },
  greetingTitle: {
    color: '#0F172A',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  greetingSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  activeLoanCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  loanCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanInfoLeft: {
    flex: 1,
  },
  activeLoanBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  activeLoanLabel: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  loanAmountValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginVertical: 2,
  },
  loanIdText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.9,
  },
  viewDetailsPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewDetailsPillText: {
    color: '#0D523B',
    fontSize: 10.5,
    fontWeight: '800',
  },
  loanMetricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricWhiteBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  miniGreenIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTitleText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  metricAmountText: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dueAlertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  dueAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dueAlertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dueAlertTextCol: {
    flex: 1,
  },
  dueAlertTitle: {
    color: '#92400E',
    fontSize: 11.5,
    fontWeight: '800',
  },
  dueAlertSub: {
    color: '#B45309',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  duePayNowBtn: {
    backgroundColor: '#0D523B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  duePayNowBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  quickActionsContainer: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  quickActionsPremiumBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  premiumActionCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumActionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF5EE',
    borderWidth: 1.5,
    borderColor: '#C6EDD7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },
  premiumActionLabel: {
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 14,
  },
  transactionsSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    color: '#0D523B',
    fontSize: 11.5,
    fontWeight: '700',
  },
  transactionListCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  txDateText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  txReceiptText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  txPaidBadge: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  txPaidBadgeText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  txDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  txEmptyBox: {
    padding: 16,
    alignItems: 'center',
  },
  txEmptyText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  bannerContainer: {
    width: '100%',
    aspectRatio: 2.745,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#F5FCF8',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  offerCard: {
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF5',
    borderRadius: 16,
    marginBottom: 14,
  },
  offerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offerBadgeText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
  },
  offerRateText: {
    color: '#0D523B',
    fontSize: 11,
    fontWeight: '800',
  },
  offerTitle: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 3,
  },
  offerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  offerApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D523B',
    borderRadius: 14,
    paddingVertical: 9,
  },
  offerApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  supportStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  supportTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  supportSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 1,
  },
  trustFooter: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalContentBlock: {
    gap: 8,
    marginBottom: 16,
  },
  modalSubText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});
