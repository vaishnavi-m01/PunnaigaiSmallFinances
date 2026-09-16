import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { fetchAssignedCustomersThunk } from '../../features/agent/collectionThunks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { AssignedCustomer } from '../../types/models';
import LinearGradient from 'react-native-linear-gradient';

type TabType = 'Overview' | 'Loan Details' | 'Payment History';



export const CustomerDetailViewScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const agent = useAppSelector(state => state.agent);

  const customerId =
    route.params?.customerId ||
    route.params?.id ||
    agent.assignedCustomers[0]?.id;
  const customer =
    agent.assignedCustomers.find(
      (c: AssignedCustomer) => String(c.id) === String(customerId),
    ) || agent.assignedCustomers[0];

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  const [timeFilter, setTimeFilter] = useState('Month');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const timeOptions = ['Today', 'Week', 'Month', 'Year'];

  const dispatch = useAppDispatch();
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchAssignedCustomersThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const handleCollectPayment = () => {
    navigation.navigate(ROUTES.ADD_COLLECTION, { customerId: customer.id });
  };

  const renderHeaderRight = () => {
    if (activeTab !== 'Payment History') return null;
    return (
      <View style={{ zIndex: 10 }}>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.dropdownButtonText}>{timeFilter}</Text>
          <AppIcon name="chevron-down" size={12} color="#64748B" />
        </TouchableOpacity>
        
        {dropdownVisible && (
          <Modal transparent animationType="fade" visible={dropdownVisible} onRequestClose={() => setDropdownVisible(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
              <View style={styles.dropdownMenu}>
                {timeOptions.map((opt, index) => {
                  const isLast = index === timeOptions.length - 1;
                  return (
                    <TouchableOpacity 
                      key={opt}
                      style={[styles.dropdownMenuItem, !isLast && { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }, timeFilter === opt && styles.dropdownMenuItemActive]}
                      onPress={() => { setTimeFilter(opt); setDropdownVisible(false); }}
                    >
                      <Text style={[styles.dropdownMenuItemText, timeFilter === opt && styles.dropdownMenuItemTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  };

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
        <StatusBar barStyle="dark-content" />
        <Header title="Customer Details" showBack={true} />
        <View style={styles.content}>
          <View style={styles.emptyCenter}>
            <Text style={[typography.bodyLarge, { color: '#94A3B8' }]}>
              Customer not found.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Mocked details based on design
  const totalLoanAmount = 50000;
  const paidAmount = totalLoanAmount - (customer.pendingAmount || 30000);
  const remainingAmount = customer.pendingAmount || 30000;

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header title="Customer Details" showBack={true} rightComponent={renderHeaderRight()} />
      
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {isRefreshing ? (
            <View style={styles.skeletonContainer}>
              <Skeleton height={100} borderRadius={16} style={styles.skeletonSpacing} />
              <Skeleton height={180} borderRadius={16} style={styles.skeletonSpacing} />
            </View>
          ) : (
            <>
              {/* Top Customer Info Card */}
              <LinearGradient
                colors={['#047857', '#064E3B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.userHeaderCard}
              >
                <View style={styles.userHeaderLeft}>
                  <View style={[styles.avatarCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFFFFF' }}>
                      {customer.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.userInfoCol}>
                    <Text style={[styles.profileName, { color: '#FFFFFF' }]}>
                      {customer.name}
                    </Text>
                    <Text style={[styles.profilePhone, { color: 'rgba(255,255,255,0.8)' }]}>
                      {customer.phone}
                    </Text>
                    <View style={styles.userMetaRow}>
                      <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                        <AppIcon name="check-circle" size={12} color={!customer.isOverdue ? '#4ADE80' : '#FCA5A5'} />
                        <Text style={[styles.verifiedBadgeText, { color: '#FFFFFF' }]}>
                          {!customer.isOverdue ? 'Active Loan' : 'Overdue'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              {/* Tabs */}
              <View style={styles.tabsWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {(['Overview', 'Loan Details', 'Payment History'] as TabType[]).map(tab => (
                    <TouchableOpacity 
                      key={tab} 
                      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                      onPress={() => setActiveTab(tab)}
                    >
                      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {activeTab === 'Overview' && (
                <>
                  {/* Amounts Stats Row */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{formatINR(totalLoanAmount)}</Text>
                      <Text style={styles.statLabel}>Total Loan</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                      <Text style={[styles.statValue, { color: '#16A34A' }]}>{formatINR(paidAmount)}</Text>
                      <Text style={[styles.statLabel, { color: '#15803D' }]}>Paid Amount</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
                      <Text style={[styles.statValue, { color: '#D97706' }]}>{formatINR(remainingAmount)}</Text>
                      <Text style={[styles.statLabel, { color: '#B45309' }]}>Remaining</Text>
                    </View>
                  </View>

              {/* Details List */}
              <View style={[styles.detailsList, { backgroundColor: colors.white }]}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconWrapper}>
                    <AppIcon name="briefcase" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={[typography.caption, { color: '#64748B' }]}>Loan Package</Text>
                    <Text style={[typography.bodyLarge, { color: '#0F172A', fontWeight: '600' }]}>Gold Loan</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconWrapper}>
                    <AppIcon name="percent" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={[typography.caption, { color: '#64748B' }]}>Interest Rate</Text>
                    <Text style={[typography.bodyLarge, { color: '#0F172A', fontWeight: '600' }]}>12%</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconWrapper}>
                    <AppIcon name="calendar" size={20} color="#8B5CF6" />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={[typography.caption, { color: '#64748B' }]}>Loan Duration</Text>
                    <Text style={[typography.bodyLarge, { color: '#0F172A', fontWeight: '600' }]}>12 Months</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconWrapper}>
                    <AppIcon name="clock" size={20} color="#EC4899" />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={[typography.caption, { color: '#64748B' }]}>Next EMI Date</Text>
                    <Text style={[typography.bodyLarge, { color: '#0F172A', fontWeight: '600' }]}>15 Sep 2026</Text>
                  </View>
                </View>

                <View style={[styles.detailItem, { marginBottom: 0 }]}>
                  <View style={styles.detailIconWrapper}>
                    <AppIcon name="user" size={20} color="#14B8A6" />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={[typography.caption, { color: '#64748B' }]}>Agent</Text>
                    <Text style={[typography.bodyLarge, { color: '#0F172A', fontWeight: '600' }]}>Selvi</Text>
                  </View>
                </View>
                </View>
              </>
              )}

              {activeTab === 'Payment History' && (
                <View style={styles.listCard}>
                  {[
                    { id: 1, due_date: '2026-09-10T00:00:00Z', amount: '12000', status: 'paid' },
                    { id: 2, due_date: '2026-08-10T00:00:00Z', amount: '12000', status: 'paid' },
                    { id: 3, due_date: '2026-10-10T00:00:00Z', amount: '12000', status: 'pending' },
                  ].map((item, index, arr) => {
                    const isPaid = item.status === 'paid';
                    const isLast = index === arr.length - 1;
                    return (
                      <View key={item.id} style={[styles.historyRow, !isLast && styles.rowBorder]}>
                        <View style={styles.historyLeft}>
                          <AppIcon name={isPaid ? 'check-circle' : 'clock'} size={20} color={isPaid ? '#10B981' : '#F59E0B'} />
                          <View style={{ marginLeft: 12 }}>
                            <Text style={styles.historyDate}>{new Date(item.due_date).toLocaleDateString()}</Text>
                            <Text style={styles.historySubtitle}>EMI Payment</Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.historyAmount}>{formatINR(Number(item.amount))}</Text>
                          <Text style={[styles.historyStatus, { color: isPaid ? '#10B981' : '#F59E0B' }]}>
                            {isPaid ? 'Paid' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  <TouchableOpacity style={styles.viewAllBtn}>
                    <Text style={styles.viewAllBtnText}>View All Transactions</Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'Loan Details' && (
                <View style={[styles.detailsList, { backgroundColor: colors.white }]}>
                  <Text style={[typography.bodyLarge, { color: '#64748B', textAlign: 'center' }]}>Loan details will appear here.</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for the bottom bar
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContainer: {
    paddingTop: 8,
  },
  skeletonSpacing: {
    marginBottom: 16,
  },
  tabsWrapper: {
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  tabButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  userHeaderCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  userHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D523B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    color: '#0F172A',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  profilePhone: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF5EE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: '#0D523B',
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  detailsList: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailTextWrapper: {
    flex: 1,
  },
  collectBtn: {
    paddingHorizontal: 16,
    height: 30,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    paddingBottom: 0,
    flex: 1,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  historySubtitle: { color: '#64748B', fontSize: 11, fontWeight: '500', marginTop: 2 },
  historyAmount: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
  historyStatus: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  viewAllBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  viewAllBtnText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 85,
  },
  dropdownButtonText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 60,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: 140,
    overflow: 'hidden',
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#ECFDF5',
  },
  dropdownMenuItemText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownMenuItemTextActive: {
    color: '#10B981',
    fontWeight: '800',
  },
});
