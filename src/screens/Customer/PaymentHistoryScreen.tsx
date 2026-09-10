import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { PaymentHistoryItem } from '../../types/models';

/**
 * Screen 7: Payment History Screen
 * Filter pills [ All ] / [ Paid ] / [ Pending ], flat payment history cards
 * with calendar icon, dates, amounts, and green Paid badges. Zero shadows.
 */
export const PaymentHistoryScreen: React.FC = () => {
  const paymentHistory = useAppSelector(state => state.customer.paymentHistory);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const filteredData = paymentHistory.filter((item: PaymentHistoryItem) => {
    if (activeFilter === 'All') return true;
    return item.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const renderHistoryCard = ({ item }: { item: PaymentHistoryItem }) => {
    const isPaid = item.status === 'Paid';

    return (
      <Card style={styles.historyCard} variant="flat" padding={12}>
        <View style={styles.cardContent}>
          {/* Left Info: Calendar Icon & Date */}
          <View style={styles.leftInfo}>
            <View style={styles.iconCircle}>
              <AppIcon name="calendar" size={16} color="#0D523B" />
            </View>
            <Text style={styles.dateText}>
              {item.date}
            </Text>
          </View>

          {/* Right Info: Amount & Status Badge */}
          <View style={styles.rightInfo}>
            <Text style={styles.amountText}>
              {formatINR(item.amount)}
            </Text>
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
      <Header title="Payment History" showBack={true} />

      <View style={styles.content}>
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

        {/* History List */}
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            renderItem={renderHistoryCard}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0D523B" />
            }
          />
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
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
  listContent: {
    paddingBottom: 24,
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
  rightInfo: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
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
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500',
  },
});
