import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { fetchAssignedCustomersThunk } from '../../features/agent/collectionThunks';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { CollectionRecord } from '../../types/models';



const AgentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography, radius } = useAppTheme();
  const agent = useAppSelector(state => state.agent);
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    dispatch(fetchAssignedCustomersThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    dispatch(fetchAssignedCustomersThunk()).finally(() => setIsRefreshing(false));
  }, [dispatch]);

  const pendingCollection = agent.assignedCustomers.reduce((sum, c) => sum + (c.pendingAmount || 0), 0);
  const commissionEarned = 0; // Not available in current API

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
            style={styles.avatarCircleHeader}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.AGENT_PROFILE)}
          >
            <View style={styles.avatarInner}>
              <AppIcon name="user" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Greeting Text */}
          <View style={styles.nameBlock}>
            <Text style={styles.greetingTitle}>
              Hello, {user?.name || 'Selvi'}
            </Text>
            <Text style={styles.greetingSubtitle}>
              Welcome back to your dashboard!
            </Text>
          </View>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => navigation.navigate(ROUTES.AGENT_NOTIFICATIONS)}
          activeOpacity={0.7}
        >
          <AppIcon name="bell" size={20} color="#0F172A" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

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
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              <Skeleton width="31%" height={90} borderRadius={12} />
              <Skeleton width="31%" height={90} borderRadius={12} />
              <Skeleton width="31%" height={90} borderRadius={12} />
            </View>
            <Skeleton height={200} borderRadius={16} style={{ marginBottom: 24 }} />
            <Skeleton height={200} borderRadius={16} />
          </View>
        ) : (
          <>
            {/* Total Customers Card */}
            <LinearGradient
              colors={['#047857', '#064E3B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.totalCustomersCard, { borderRadius: radius.xl }]}
            >
              <View>
                <Text style={[typography.subtitle, { color: colors.white, opacity: 0.9 }]}>
                  Total Assigned Customers
                </Text>
                <Text style={[typography.h1, { color: colors.white, marginTop: 4 }]}>
                  {agent.assignedCustomers.length || 0}
                </Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <AppIcon name="users" size={24} color={colors.white} />
              </View>
            </LinearGradient>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={[typography.caption, { color: '#64748B', fontSize: 11 }]}>Total Collection</Text>
                  <Text style={[typography.h4, { color: '#16A34A', marginTop: 8 }]}>
                    {formatINR(agent.totalCollection || 0)}
                  </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
                  <Text style={[typography.caption, { color: '#EF4444', fontSize: 11 }]}>Pending</Text>
                  <Text style={[typography.h4, { color: '#EF4444', marginTop: 8 }]}>
                    {formatINR(pendingCollection)}
                  </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#F5F3FF' }]}>
                  <Text style={[typography.caption, { color: '#8B5CF6', fontSize: 11 }]}>Commission</Text>
                  <Text style={[typography.h4, { color: '#8B5CF6', marginTop: 8 }]}>
                    {formatINR(commissionEarned)}
                  </Text>
                </View>
              </View>

              {/* Quick Actions */}
              <Text style={[typography.h4, styles.sectionTitle, { color: '#0F172A' }]}>
                Quick Actions
              </Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate(ROUTES.ASSIGNED_CUSTOMERS)}>
                  <View style={[styles.actionIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                    <AppIcon name="users" size={24} color="#0284C7" />
                  </View>
                  <Text style={[typography.caption, styles.actionText]}>Customers</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate(ROUTES.COLLECTION_HISTORY)}>
                  <View style={[styles.actionIconWrapper, { backgroundColor: '#DCFCE7' }]}>
                    <AppIcon name="file-text" size={24} color="#16A34A" />
                  </View>
                  <Text style={[typography.caption, styles.actionText]}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate(ROUTES.AGENT_REPORTS)}>
                  <View style={[styles.actionIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                    <AppIcon name="pie-chart" size={24} color="#D97706" />
                  </View>
                  <Text style={[typography.caption, styles.actionText]}>Reports</Text>
                </TouchableOpacity>
              </View>

              {/* Recent Collections */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[typography.h4, { color: '#0F172A' }]}>Recent Collections</Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.COLLECTION_HISTORY)}>
                  <Text style={[typography.subtitle, { color: '#16A34A' }]}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.collectionsList}>
                {agent.collections.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={[typography.bodyMedium, { color: '#94A3B8' }]}>No recent collections</Text>
                  </View>
                ) : (
                  agent.collections.slice(0, 4).map((col: CollectionRecord) => (
                    <View key={col.id} style={[styles.colCard, { backgroundColor: colors.white }]}>
                      <View style={styles.colRow}>
                        <View style={styles.colLeft}>
                          <View style={[styles.avatarCircle, { backgroundColor: '#E0E7FF' }]}>
                            <Text style={[typography.h4, { color: '#4338CA' }]}>{col.customerName.charAt(0)}</Text>
                          </View>
                          <View style={{ marginLeft: 12 }}>
                            <Text style={[typography.subtitle, { color: '#0F172A' }]}>{col.customerName}</Text>
                            <Text style={[typography.caption, { color: '#64748B', marginTop: 4 }]}>
                              {formatINR(col.amount)}
                            </Text>
                            <Text style={[typography.caption, { color: '#94A3B8' }]}>
                              {col.date} • {col.paymentMethod}
                            </Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                            <Text style={[typography.caption, { color: '#16A34A' }]}>Paid</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};
export { AgentDashboardScreen };

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
  avatarCircleHeader: {
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
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  totalCustomersCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  actionItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    textAlign: 'center',
    color: '#64748B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionsList: {
    gap: 12,
  },
  colCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  colRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
