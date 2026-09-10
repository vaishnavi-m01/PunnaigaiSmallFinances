import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { PaymentScheduleItem, PaymentHistoryItem } from '../../types/models';
import { ROUTES } from '../../constants/routes';
import { Skeleton } from '../../component/Common/Skeleton';

/**
 * Screen 6: Payments Tab Screen
 * Features two segmented tabs:
 * 1. [ Payment Schedule ] - Side-by-side Total Amount & Monthly EMI cards, 4-column schedule table
 * 2. [ Payment History ] - Filter pills [ All ] / [ Paid ] / [ Pending ] & payment transaction cards
 */
export const PaymentScheduleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const schedule = useAppSelector(state => state.customer.paymentSchedule);
  const paymentHistory = useAppSelector(state => state.customer.paymentHistory);
  const loan = useAppSelector(state => state.customer.loan);

  const [activeTab, setActiveTab] = useState<'schedule' | 'history'>('schedule');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const filteredHistory = paymentHistory.filter((item: PaymentHistoryItem) => {
    if (activeFilter === 'All') return true;
    return item.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const renderScheduleItem = ({ item }: { item: PaymentScheduleItem }) => {
    const isPaid = item.status.toLowerCase() === 'paid';
    return (
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleLeft}>
          <View style={styles.scheduleNoCircle}>
            <Text style={styles.scheduleNoText}>{item.no}</Text>
          </View>
          <View>
            <Text style={styles.scheduleDateLabel}>Due Date</Text>
            <Text style={styles.scheduleDateText}>{item.dueDate}</Text>
          </View>
        </View>
        <View style={styles.scheduleRight}>
          <Text style={styles.scheduleAmountText}>{formatINR(item.amount)}</Text>
          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7',
                borderColor: isPaid ? '#86EFAC' : '#FDE68A',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isPaid ? '#15803D' : '#D97706' },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHistoryCard = ({ item }: { item: PaymentHistoryItem }) => {
    const isPaid = item.status.toLowerCase() === 'paid';
    return (
      <Card style={styles.historyCard} variant="flat" padding={12}>
        <View style={styles.cardContent}>
          {/* Left Info: Calendar Icon & Date / Receipt */}
          <View style={styles.leftInfo}>
            <View style={styles.iconCircle}>
              <AppIcon name="calendar" size={16} color="#0D523B" />
            </View>
            <View>
              <Text style={styles.dateText}>{item.date}</Text>
              {item.receiptNo ? (
                <Text style={styles.receiptText}>Receipt: {item.receiptNo}</Text>
              ) : null}
            </View>
          </View>

          {/* Right Info: Amount & Status Badge */}
          <View style={styles.rightInfo}>
            <Text style={styles.amountText}>{formatINR(item.amount)}</Text>
            <View
              style={[
                styles.badgePill,
                {
                  backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7',
                  borderColor: isPaid ? '#86EFAC' : '#FDE68A',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isPaid ? '#15803D' : '#D97706' },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Payments" showBack={false} showNotification={true} />

      <View style={styles.content}>
        {/* Top 2 Segmented Tabs: [ Payment Schedule ] | [ Payment History ] */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'schedule' && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab('schedule')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'schedule' ? '#FFFFFF' : '#64748B' },
              ]}
            >
              Payment Schedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'history' && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'history' ? '#FFFFFF' : '#64748B' },
              ]}
            >
              Payment History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'schedule' ? (
          /* TAB 1: Payment Schedule View */
          <View style={styles.tabInner}>
            {/* Top 2 Side-by-Side Summary Cards */}
            <View style={styles.summaryRow}>
              {/* Card 1: Total Amount */}
              <View style={styles.summaryCardLight}>
                <View style={styles.summaryCardTopRow}>
                  <View style={styles.summaryIconGreen}>
                    <AppIcon name="pie-chart" size={13} color="#0D523B" />
                  </View>
                  <Text style={styles.summaryCardLabel}>Total Amount</Text>
                </View>
                <Text style={styles.summaryCardValue}>
                  {formatINR(loan.loanAmount || 100000)}
                </Text>
                <View style={styles.summaryCardFooter}>
                  <View style={styles.summaryDot} />
                  <Text style={styles.summaryCardTag}>Loan Principal</Text>
                </View>
              </View>

              {/* Card 2: Monthly EMI */}
              <View style={[styles.summaryCardLight, styles.summaryCardEmiAccent]}>
                <View style={styles.summaryCardTopRow}>
                  <View style={styles.summaryIconTeal}>
                    <AppIcon name="calendar" size={13} color="#0D523B" />
                  </View>
                  <Text style={styles.summaryCardLabel}>Monthly EMI</Text>
                </View>
                <Text style={styles.summaryCardValue}>
                  {formatINR(loan.monthlyEmi || 9000)}
                </Text>
                <View style={styles.summaryCardFooter}>
                  <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.summaryCardTag}>Per Month</Text>
                </View>
              </View>
            </View>

            {/* Premium Schedule List */}
            <View style={styles.scheduleListContainer}>
              {isRefreshing ? (
                <View style={{ paddingTop: 16 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} height={60} borderRadius={12} style={{ marginBottom: 12 }} />
                  ))}
                </View>
              ) : (
                <FlatList
                  data={schedule}
                  keyExtractor={item => String(item.no)}
                  renderItem={renderScheduleItem}
                  ItemSeparatorComponent={() => <View style={styles.scheduleSeparator} />}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />
                  }
                />
              )}
            </View>
          </View>
        ) : (
          /* TAB 2: Payment History Records View */
          <View style={styles.tabInner}>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {(['All', 'Paid', 'Pending'] as const).map(filter => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isActive ? '#0D523B' : '#FFFFFF',
                        borderColor: isActive ? '#0D523B' : '#E2E8F0',
                      },
                    ]}
                    onPress={() => setActiveFilter(filter)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        {
                          color: isActive ? '#FFFFFF' : '#64748B',
                          fontWeight: isActive ? '800' : '600',
                        },
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* History List of Records */}
            {isRefreshing ? (
              <View style={{ paddingTop: 16 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} height={70} borderRadius={12} style={{ marginBottom: 12 }} />
                ))}
              </View>
            ) : (
              <FlatList
                data={filteredHistory}
                keyExtractor={item => item.id}
                renderItem={renderHistoryCard}
                ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.historyListContent}
                refreshControl={
                  <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <AppIcon name="file-text" size={36} color="#94A3B8" />
                    <Text style={styles.emptyText}>
                      No payment records found for this filter.
                    </Text>
                    <TouchableOpacity
                      style={styles.makePayBtn}
                      onPress={() => navigation.navigate(ROUTES.PENDING_AMOUNT)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.makePayBtnText}>Make a Payment</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 3,
    borderRadius: 20,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 18,
  },
  activeTabBtn: {
    backgroundColor: '#0D523B',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabInner: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCardLight: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderTopWidth: 3,
    borderTopColor: '#0D523B',
  },
  summaryCardEmiAccent: {
    borderTopColor: '#10B981',
  },
  summaryCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryIconGreen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryIconTeal: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCardLabel: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '600',
  },
  summaryCardValue: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  summaryCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D523B',
  },
  summaryCardTag: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '600',
  },
  scheduleListContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 2,
    paddingBottom: 24,
  },
  scheduleSeparator: {
    height: 10,
  },
  scheduleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleNoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleNoText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  scheduleDateLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleDateText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  scheduleRight: {
    alignItems: 'flex-end',
  },
  scheduleAmountText: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '900',
    marginBottom: 4,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  historyListContent: {
    paddingBottom: 24,
  },
  historySeparator: {
    height: 8,
  },
  historyCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  receiptText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 16,
    fontWeight: '500',
  },
  makePayBtn: {
    backgroundColor: '#0D523B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  makePayBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
