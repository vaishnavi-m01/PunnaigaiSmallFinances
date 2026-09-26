import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../component/Header';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { fetchDashboardThunk, fetchOverdueThunk } from '../../store/customerSlice';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { ROUTES } from '../../constants/routes';
import { BotanicalLeaves } from '../../component/Common/BotanicalArt';
import { formatINR } from '../../utils/currency';

/**
 * Screen 9: Overdue Details Screen
 * Displays total overdue amount and a list of overdue schedules.
 */
export const OverdueDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useAppDispatch();
  const { overdueData, isOverdueLoading } = useAppSelector(state => state.customer);
  
  useEffect(() => {
    dispatch(fetchOverdueThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchDashboardThunk()),
      dispatch(fetchOverdueThunk()),
    ]);
    setIsRefreshing(false);
  }, [dispatch]);

  const totalOverdue = overdueData?.totalDue || 0;
  const overdueList = overdueData?.overdue || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Overdue Details" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0D523B" />
        }
      >
        {isOverdueLoading && !isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={150} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={150} borderRadius={16} />
          </View>
        ) : (
          <>
            {/* Total Overdue Banner Card */}
            <Card style={styles.bannerCard} variant="flat" padding={18}>
              <BotanicalLeaves
                width={100}
                height={70}
                opacity={0.08}
                color="#EF4444"
                style={styles.bannerLeaves}
              />
              <Text style={styles.bannerLabel}>
                Total Overdue Amount
              </Text>
              <Text style={styles.overdueAmount}>
                {formatINR(totalOverdue)}
              </Text>
            </Card>

            {/* Overdue List */}
            {overdueList.length > 0 ? (
              overdueList.map((item, index) => (
                <Card key={item.scheduleId} style={styles.breakdownCard} variant="flat" padding={14}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardPackageName}>{item.loanPackageName}</Text>
                    <View style={styles.badgePending}>
                      <Text style={styles.badgePendingText}>Pending</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                        <AppIcon name="calendar" size={16} color="#D97706" />
                      </View>
                      <Text style={styles.rowTitle}>Due Date</Text>
                    </View>
                    <Text style={styles.rowValue}>{item.dueDate}</Text>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                        <AppIcon name="alert-triangle" size={16} color="#EF4444" />
                      </View>
                      <Text style={styles.rowTitle}>EMI Amount</Text>
                    </View>
                    <Text style={styles.rowValue}>{formatINR(item.amount)}</Text>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                        <AppIcon name="trending-up" size={16} color="#0284C7" />
                      </View>
                      <Text style={styles.rowTitle}>Penalty</Text>
                    </View>
                    <Text style={styles.rowValue}>{formatINR(item.penalty)}</Text>
                  </View>

                  <View style={styles.divider} />
                  
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Due for Schedule</Text>
                    <Text style={styles.totalValue}>{formatINR(item.totalDue)}</Text>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyBox}>
                <AppIcon name="check-circle" size={40} color="#10B981" />
                <Text style={styles.emptyText}>No overdue payments.</Text>
              </View>
            )}

            {/* Info Notice Card */}
            {totalOverdue > 0 && (
              <Card style={styles.infoCard} variant="flat" padding={12}>
                <View style={styles.infoRow}>
                  <AppIcon name="info" size={18} color="#0284C7" />
                  <Text style={styles.infoText}>
                    Please clear your dues immediately to avoid further penalty charges.
                  </Text>
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  bannerCard: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerLeaves: {
    right: -10,
    top: 10,
  },
  bannerLabel: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  overdueAmount: {
    marginTop: 4,
    fontWeight: '900',
    fontSize: 26,
    color: '#EF4444',
    letterSpacing: -0.5,
  },
  breakdownCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardPackageName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePendingText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rowTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  rowValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  totalLabel: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  totalValue: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    color: '#0369A1',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    fontWeight: '600',
  },
});
