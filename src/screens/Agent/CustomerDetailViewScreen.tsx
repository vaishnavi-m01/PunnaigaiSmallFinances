import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { CustomButton } from '../../component/Common/CustomButton';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { AssignedCustomer } from '../../types/models';

type TabType = 'Overview' | 'Loan Details' | 'Payment History';

const HeaderGraphic = () => (
  <View
    style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]}
    pointerEvents="none"
  >
    <View
      style={{
        position: 'absolute',
        top: -30,
        right: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.06)',
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 40,
        right: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.04)',
      }}
    />
  </View>
);

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

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const handleCollectPayment = () => {
    navigation.navigate(ROUTES.ADD_COLLECTION, { customerId: customer.id });
  };

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: '#168B5E' }]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={['#0B533E', '#168B5E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        >
          <HeaderGraphic />
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <AppIcon name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={[typography.h3, { color: colors.white }]}>
              Customer Details
            </Text>
            <View style={styles.backBtn} />
          </View>
        </LinearGradient>
        <View style={styles.pageContainer}>
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
    <View style={[styles.container, { backgroundColor: '#168B5E' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0B533E', '#168B5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}
      >
        <HeaderGraphic />
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <AppIcon name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: colors.white }]}>
            Customer Details
          </Text>
          <View style={styles.backBtn} />
        </View>
      </LinearGradient>

      <View style={styles.pageContainer}>
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
              <View style={[styles.profileCard, { backgroundColor: colors.white }]}>
                <View style={styles.profileHeaderRow}>
                  <View style={styles.profileLeft}>
                    <View style={[styles.avatarCircle, { backgroundColor: '#E0F2FE' }]}>
                      <Text style={[typography.h2, { color: '#0284C7' }]}>
                        {customer.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 16 }}>
                      <Text style={[typography.h3, { color: '#0F172A' }]}>
                        {customer.name}
                      </Text>
                      <Text style={[typography.bodyMedium, { color: '#64748B', marginTop: 4 }]}>
                        {customer.phone}
                      </Text>
                      <View style={styles.locationRow}>
                        <AppIcon name="map-pin" size={12} color="#94A3B8" />
                        <Text style={[typography.caption, { color: '#64748B', marginLeft: 4 }]}>
                          {customer.address || 'Tenkasi'}
                        </Text>
                      </View>
                    </View>
                  </View>
                    <View style={{ alignItems: 'flex-end', gap: 12 }}>
                      <View style={[styles.statusBadge, { backgroundColor: !customer.isOverdue ? '#DCFCE7' : '#FEE2E2' }]}>
                        <Text style={[typography.caption, { color: !customer.isOverdue ? '#16A34A' : '#EF4444' }]}>
                          {!customer.isOverdue ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        style={[styles.collectBtn, { backgroundColor: '#10B981' }]}
                        onPress={handleCollectPayment}
                        activeOpacity={0.8}
                      >
                        <Text style={[typography.caption, { color: colors.white, fontWeight: '700' }]}>Collect</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

              {/* Amounts Card */}
              <LinearGradient
                colors={['#0F766E', '#064E3B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.amountsCard}
              >
                <View style={styles.amountRow}>
                  <Text style={[typography.bodyLarge, { color: 'rgba(255,255,255,0.8)' }]}>Total Loan Amount</Text>
                  <Text style={[typography.h3, { color: '#FFFFFF' }]}>{formatINR(totalLoanAmount)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                <View style={styles.amountRow}>
                  <Text style={[typography.bodyLarge, { color: 'rgba(255,255,255,0.8)' }]}>Paid Amount</Text>
                  <Text style={[typography.h3, { color: '#6EE7B7' }]}>{formatINR(paidAmount)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                <View style={styles.amountRow}>
                  <Text style={[typography.bodyLarge, { color: '#FFFFFF', fontWeight: '700' }]}>Remaining Amount</Text>
                  <Text style={[typography.h3, { color: '#FCD34D' }]}>{formatINR(remainingAmount)}</Text>
                </View>
              </LinearGradient>

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
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    padding: 8,
    width: 40,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
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
  profileCard: {
    borderRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tabButton: {
    paddingVertical: 16,
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
  },
  amountsCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
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
});
