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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { fetchDashboardThunk } from '../../store/customerSlice';
import { AppIcon, IconName } from '../../component/AppIcon';
import { ROUTES } from '../../constants/routes';
import { AppNotification, PaymentHistoryItem } from '../../types/models';
import { formatINR } from '../../utils/currency';
import { Card } from '../../component/Common/Card';
import { CustomButton } from '../../component/Common/CustomButton';
import { Skeleton } from '../../component/Common/Skeleton';

export const CustomerDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const loan = useAppSelector(state => state.customer.loan);
  const paymentHistory = useAppSelector(state => state.customer.paymentHistory);
  const unreadCount = useAppSelector(
    state =>
      state.customer.notifications.filter((n: AppNotification) => !n.isRead)
        .length,
  );

  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real dashboard data on mount
  useEffect(() => {
    dispatch(fetchDashboardThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchDashboardThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const quickActions: {
    id: string;
    title: string;
    icon: IconName;
    route: string;
  }[] = [
    {
      id: 'packages',
      title: 'Loan\nPackages',
      icon: 'briefcase',
      route: ROUTES.APPLY_LOAN,
    },

    {
      id: 'profile',
      title: 'My\nProfile',
      icon: 'user',
      route: ROUTES.CUSTOMER_PROFILE,
    },
    {
      id: 'schedule',
      title: 'View\nSchedule',
      icon: 'calendar',
      route: ROUTES.PAYMENT_SCHEDULE,
    },
    {
      id: 'more',
      title: 'More\nDetails',
      icon: 'grid',
      route: ROUTES.OVERDUE_DETAILS,
    },
  ];

  const recentPayments = paymentHistory.slice(0, 2);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <View
        style={[styles.topHeader, { paddingTop: Math.max(insets.top + 6, 16) }]}
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
              Hello, {user?.name || 'Raji Kumar'}
            </Text>
            <Text style={styles.greetingSubtitle}>
              Welcome back! • {loan.loanId || 'PLN000123'}
            </Text>
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
      </View>

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
        {isRefreshing ? (
          <View style={{ paddingTop: 16 }}>
            {/* Skeleton Hero */}
            <Skeleton
              height={200}
              borderRadius={24}
              style={{ marginBottom: 20 }}
            />
            {/* Skeleton Alert */}
            <Skeleton
              height={60}
              borderRadius={16}
              style={{ marginBottom: 24 }}
            />
            {/* Skeleton Quick Actions */}
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
            {/* Skeleton List */}
            <Skeleton height={30} width={150} style={{ marginBottom: 16 }} />
            <Skeleton
              height={80}
              borderRadius={16}
              style={{ marginBottom: 12 }}
            />
            <Skeleton
              height={80}
              borderRadius={16}
              style={{ marginBottom: 12 }}
            />
          </View>
        ) : (
          <>
            {/* 1. Compact Active Loan Card (Deep Emerald Gradient with 2 Sub-Boxes) */}
            <LinearGradient
              colors={['#065F46', '#047857']}
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
                  <Text style={styles.loanAmountValue}>₹ 88,000</Text>
                  <Text style={styles.loanIdText}>
                    Loan ID: {loan.loanId || 'PLN000123'}
                  </Text>
                </View>

                {/* White View Details Pill Button */}
                <TouchableOpacity
                  style={styles.viewDetailsPill}
                  onPress={() => navigation.navigate(ROUTES.MY_LOAN)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewDetailsPillText}>View Details</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Row: 2 Crisp White Sub-Boxes */}
              <View style={styles.loanMetricsRow}>
                {/* Box 1: Pending Amount */}
                <TouchableOpacity
                  style={styles.metricWhiteBox}
                  onPress={() => navigation.navigate(ROUTES.PENDING_AMOUNT)}
                  activeOpacity={0.85}
                >
                  <View style={styles.metricHeaderRow}>
                    <View style={styles.miniGreenIcon}>
                      <AppIcon name="calendar" size={12} color="#0D523B" />
                    </View>
                    <Text style={styles.metricTitleText}>Pending Amount</Text>
                  </View>
                  <Text style={styles.metricAmountText}>₹ 12,000</Text>
                </TouchableOpacity>

                {/* Box 2: Next Payment Date */}
                <TouchableOpacity
                  style={styles.metricWhiteBox}
                  onPress={() => navigation.navigate(ROUTES.PAYMENT_SCHEDULE)}
                  activeOpacity={0.85}
                >
                  <View style={styles.metricHeaderRow}>
                    <View style={styles.miniGreenIcon}>
                      <AppIcon name="calendar" size={12} color="#0D523B" />
                    </View>
                    <Text style={styles.metricTitleText}>
                      Next Payment Date
                    </Text>
                  </View>
                  <Text style={styles.metricAmountText}>15 Apr 2025</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* 2. Upcoming EMI Due Alert Strip */}
            <View style={styles.dueAlertCard}>
              <View style={styles.dueAlertLeft}>
                <View style={styles.dueAlertIconCircle}>
                  <AppIcon name="bell" size={15} color="#D97706" />
                </View>
                <View style={styles.dueAlertTextCol}>
                  <Text style={styles.dueAlertTitle}>
                    Next EMI Due in 7 Days
                  </Text>
                  <Text style={styles.dueAlertSub}>₹ 9,000 on 15 Apr 2025</Text>
                </View>
              </View>
            </View>

            {/* 3. Premium Gradient Quick Actions Bar */}
            <View style={styles.quickActionsContainer}>
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
            </View>

            {/* 4. Recent Transactions Section */}
            <View style={styles.transactionsSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Recent Transactions</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.PAYMENT_HISTORY)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View All &gt;</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.transactionListCard}>
                {recentPayments.length > 0 ? (
                  recentPayments.map(
                    (item: PaymentHistoryItem, index: number) => {
                      const isLast = index === recentPayments.length - 1;
                      return (
                        <React.Fragment key={item.id}>
                          <TouchableOpacity
                            style={styles.transactionItem}
                            onPress={() =>
                              navigation.navigate(ROUTES.PAYMENT_HISTORY)
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
                                  {item.date}
                                </Text>
                                <Text style={styles.txReceiptText}>
                                  Receipt: {item.receiptNo || 'RCP-849201'}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.transactionRight}>
                              <Text style={styles.txAmountText}>
                                {formatINR(item.amount)}
                              </Text>
                              <View style={styles.txPaidBadge}>
                                <Text style={styles.txPaidBadgeText}>Paid</Text>
                              </View>
                            </View>
                          </TouchableOpacity>

                          {!isLast && <View style={styles.txDivider} />}
                        </React.Fragment>
                      );
                    },
                  )
                ) : (
                  <View style={styles.txEmptyBox}>
                    <Text style={styles.txEmptyText}>
                      No recent payments found.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 5. Secure Your Future Promotional Banner */}
            <View style={styles.bannerContainer}>
              <Image
                source={require('../../assets/images/HomePageBanner.png')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>

            {/* 6. Pre-Approved Top-up / Special Offer Card */}
            <Card style={styles.offerCard} variant="flat" padding={14}>
              <View style={styles.offerTopRow}>
                <View style={styles.offerBadge}>
                  <AppIcon name="star" size={12} color="#D97706" />
                  <Text style={styles.offerBadgeText}>Special Offer</Text>
                </View>
                <Text style={styles.offerRateText}>10.5% p.a.</Text>
              </View>

              <Text style={styles.offerTitle}>Pre-Approved Top-up Loan</Text>
              <Text style={styles.offerSubtitle}>
                You are pre-qualified for an instant top-up up to ₹ 2,00,000
                with zero documentation.
              </Text>

              <TouchableOpacity
                style={styles.offerApplyBtn}
                onPress={() => navigation.navigate(ROUTES.APPLY_LOAN)}
                activeOpacity={0.8}
              >
                <Text style={styles.offerApplyBtnText}>Apply in 2 Minutes</Text>
                <AppIcon name="chevron-right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </Card>

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
    backgroundColor: 'rgba(167, 243, 208, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  activeLoanLabel: {
    color: '#A7F3D0',
    fontSize: 10.5,
    fontWeight: '700',
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
