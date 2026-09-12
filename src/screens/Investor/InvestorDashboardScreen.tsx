import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { WalletTransaction } from '../../types/models';

const HeaderGraphic = () => (
  <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]} pointerEvents="none">
    <View style={{
      position: 'absolute',
      top: -30,
      right: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.06)'
    }} />
    <View style={{
      position: 'absolute',
      top: 40,
      right: -80,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(255,255,255,0.04)'
    }} />
  </View>
);

export const InvestorDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography, radius } = useAppTheme();
  const investor = useAppSelector(state => state.investor);
  const user = useAppSelector(state => state.auth.user);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  // Mock investments for timeline
  const mockInvestments = [
    { id: '1', amount: 500000, date: '2 Sep 2026, 10:00 AM', status: 'Active', roi: '2% / mo' },
    { id: '2', amount: 500000, date: '10 Aug 2026, 02:15 PM', status: 'Active', roi: '2% / mo' },
  ];

  const totalInvested = investor.details.totalInvestment;
  const totalEarnings = investor.details.totalPaymentsReceived;
  const walletBalance = investor.details.walletBalance;

  return (
    <View style={[styles.container, { backgroundColor: '#0284C7' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Area */}
      <LinearGradient
        colors={['#0369A1', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}
      >
        <HeaderGraphic />
        <View style={styles.headerTitleRow}>
          <Text style={[typography.h3, { color: colors.white }]}>
            Hello, {user?.name || 'Ravi Chandran'} 👋
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.INVESTOR_NOTIFICATIONS)}>
            <View style={styles.notifBadge}>
              <AppIcon name="bell" size={20} color={colors.white} />
              <View style={styles.badgeDot} />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Full Page White Container */}
      <View style={styles.pageContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {isRefreshing ? (
            <View style={{ paddingTop: 16 }}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                <Skeleton width="48%" height={100} borderRadius={16} />
                <Skeleton width="48%" height={100} borderRadius={16} />
              </View>
              <Skeleton height={140} borderRadius={16} style={{ marginBottom: 24 }} />
              <Skeleton width={200} height={24} style={{ marginBottom: 16 }} />
              <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
              <Skeleton height={80} borderRadius={16} />
            </View>
          ) : (
            <View style={styles.contentPad}>
              
              {/* Summary Stats Row */}
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#F0F9FF' }]}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#E0F2FE' }]}>
                    <AppIcon name="trending-up" size={20} color="#0284C7" />
                  </View>
                  <Text style={[typography.caption, { color: '#0284C7', marginTop: 12, fontWeight: '600' }]}>
                    Total Invested
                  </Text>
                  <Text style={[typography.h3, { color: '#0369A1', marginTop: 4 }]}>
                    {formatINR(totalInvested)}
                  </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                    <AppIcon name="pie-chart" size={20} color="#16A34A" />
                  </View>
                  <Text style={[typography.caption, { color: '#16A34A', marginTop: 12, fontWeight: '600' }]}>
                    Total Earnings
                  </Text>
                  <Text style={[typography.h3, { color: '#15803D', marginTop: 4 }]}>
                    {formatINR(totalEarnings)}
                  </Text>
                </View>
              </View>

              {/* Wallet Card */}
              <LinearGradient
                colors={['#0F172A', '#1E293B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.walletCard}
              >
                <View style={styles.walletLeft}>
                  <Text style={[typography.caption, { color: '#94A3B8' }]}>Available Wallet Balance</Text>
                  <Text style={[typography.h2, { color: colors.white, marginTop: 4 }]}>
                    {formatINR(walletBalance)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.withdrawBtn}
                  onPress={() => navigation.navigate(ROUTES.INVESTOR_WITHDRAW)}
                >
                  <Text style={[typography.bodyMedium, { color: '#0F172A', fontWeight: '700' }]}>Withdraw</Text>
                </TouchableOpacity>
              </LinearGradient>

              {/* Investment Timeline */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[typography.h4, { color: '#0F172A' }]}>Your Investments</Text>
              </View>

              <View style={styles.timelineList}>
                {mockInvestments.map((inv, index) => (
                  <View key={inv.id} style={styles.timelineItem}>
                    {/* Timeline Line (except for last item) */}
                    {index !== mockInvestments.length - 1 && <View style={styles.timelineLine} />}
                    
                    {/* Timeline Dot */}
                    <View style={styles.timelineDot} />

                    {/* Timeline Content */}
                    <View style={[styles.timelineContent, { backgroundColor: colors.white }]}>
                      <View style={styles.timelineRow}>
                        <View>
                          <Text style={[typography.caption, { color: '#64748B' }]}>Investment Amount</Text>
                          <Text style={[typography.h3, { color: '#0F172A', marginTop: 2 }]}>{formatINR(inv.amount)}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                          <Text style={[typography.caption, { color: '#16A34A' }]}>{inv.status}</Text>
                        </View>
                      </View>
                      
                      <View style={[styles.timelineDivider, { backgroundColor: '#F1F5F9' }]} />
                      
                      <View style={styles.timelineFooterRow}>
                        <View style={styles.timelineFooterItem}>
                          <AppIcon name="calendar" size={14} color="#94A3B8" />
                          <Text style={[typography.caption, { color: '#64748B', marginLeft: 4 }]}>{inv.date}</Text>
                        </View>
                        <View style={styles.timelineFooterItem}>
                          <AppIcon name="trending-up" size={14} color="#F59E0B" />
                          <Text style={[typography.caption, { color: '#64748B', marginLeft: 4 }]}>ROI: {inv.roi}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Recent ROI History */}
              <View style={[styles.sectionHeaderRow, { marginTop: 8 }]}>
                <Text style={[typography.h4, { color: '#0F172A' }]}>Recent ROI Credits</Text>
                <TouchableOpacity>
                  <Text style={[typography.subtitle, { color: '#0284C7' }]}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.roiList}>
                {investor.transactions.slice(0, 3).map((tx: WalletTransaction) => (
                  <View key={tx.id} style={[styles.roiCard, { backgroundColor: colors.white }]}>
                    <View style={styles.roiLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                        <AppIcon name="arrow-down-left" size={18} color="#10B981" />
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[typography.bodyLarge, { color: '#0F172A', fontWeight: '700' }]}>
                          {tx.title}
                        </Text>
                        <Text style={[typography.caption, { color: '#64748B', marginTop: 2 }]}>
                          {tx.date}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[typography.bodyLarge, { color: '#10B981', fontWeight: '800' }]}>
                        + {formatINR(tx.amount)}
                      </Text>
                      <Text style={[typography.caption, { color: '#94A3B8', marginTop: 2 }]}>
                        {tx.referenceNo}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

            </View>
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
    height: 40,
  },
  notifBadge: {
    padding: 8,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
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
    paddingBottom: 40,
  },
  contentPad: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  walletLeft: {
    flex: 1,
  },
  withdrawBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineList: {
    paddingLeft: 8,
    marginBottom: 24,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 24,
    marginBottom: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 24,
    bottom: -24,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  timelineContent: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timelineDivider: {
    height: 1,
    marginVertical: 12,
  },
  timelineFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roiList: {
    gap: 12,
  },
  roiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
