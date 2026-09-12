import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { Skeleton } from '../../component/Common/Skeleton';
import * as customerApi from '../../services/api/customerApi';
import { formatDate } from '../../utils/date';

type TimeFilter = 'Today' | 'Week' | 'Month' | 'Year';

// Build date range strings from filter
const getDateRange = (filter: TimeFilter): { from_date: string; to_date: string } => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const to_date = fmt(now);
  let from = new Date(now);

  switch (filter) {
    case 'Today':
      // from = today, to = today
      break; 
    case 'Week':
      // start of week (Sunday or Monday, depending on locale, let's use 7 days ago or start of current week)
      // The prompt says: "week na week start panna start date and enddate la tdy date"
      // Assuming week starts on Sunday
      from.setDate(now.getDate() - now.getDay());
      break;
    case 'Month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'Year':
      from = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return { from_date: fmt(from), to_date };
};

export const PaymentScheduleScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('Month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState<customerApi.PaymentHistoryRecord[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = React.useCallback(async (filter: TimeFilter) => {
    setIsLoading(true);
    try {
      const range = getDateRange(filter);
      console.log(`[PaymentHistory] Filter: ${filter} => calling API with from_date: ${range.from_date}, to_date: ${range.to_date}`);
      const data = await customerApi.getPaymentHistory(range);
      setHistoryData(Array.isArray(data?.data) ? data.data : []);
      setTotalAmount(data?.total_payment ?? 0);
    } catch {
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeFilter);
  }, [activeFilter, loadData]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await loadData(activeFilter);
    setIsRefreshing(false);
  }, [activeFilter, loadData]);

  const renderHistoryCard = ({ item }: { item: customerApi.PaymentHistoryRecord }) => {
    const isPaid = ['paid', 'completed', 'approved'].includes(item.status?.toLowerCase());
    return (
      <Card style={styles.historyCard} variant="flat" padding={12}>
        <View style={styles.cardContent}>
          {/* Left: Icon + Date */}
          <View style={styles.leftInfo}>
            <View style={styles.iconCircle}>
              <AppIcon name="calendar" size={16} color="#0D523B" />
            </View>
            <View>
              <Text style={styles.dateText}>
                {formatDate(item.paid_at)}
              </Text>
              <Text style={styles.receiptText}>
                {item.loan_package_name} • {item.mode ? item.mode.charAt(0).toUpperCase() + item.mode.slice(1) : ''}
              </Text>
            </View>
          </View>

          {/* Right: Amount + Badge */}
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
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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
      <Header title="Payment History" showBack={false} showNotification={true} />

      <View style={styles.content}>
        {/* Time Filter Pills */}
        <View style={styles.filterRow}>
          {(['Today', 'Week', 'Month', 'Year'] as TimeFilter[]).map(filter => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.activeFilterPill]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.activeFilterPillText,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hero Summary Card */}
        <LinearGradient
          colors={['#083827', '#0D523B', '#126349']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroIconCircle}>
              <AppIcon name="pie-chart" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Total Payments ({activeFilter})</Text>
          </View>
          <Text style={styles.heroAmount}>{formatINR(totalAmount)}</Text>
          <Text style={styles.heroSubtitle}>
            {isLoading
              ? 'Loading...'
              : `${historyData.length} transaction${historyData.length !== 1 ? 's' : ''}`}
          </Text>
        </LinearGradient>

        {/* History List */}
        {isLoading ? (
          <View style={{ paddingTop: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton
                key={i}
                height={70}
                borderRadius={12}
                style={{ marginBottom: 10 }}
              />
            ))}
          </View>
        ) : (
          <FlatList
            data={historyData}
            keyExtractor={item => String(item.payment_id)}
            renderItem={renderHistoryCard}
            ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyListContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#10B981"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppIcon name="file-text" size={36} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  No payments found for {activeFilter.toLowerCase()}.
                </Text>
              </View>
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
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  activeFilterPill: {
    backgroundColor: '#0D523B',
    borderColor: '#0D523B',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  heroCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heroTitle: {
    color: '#A7F3D0',
    fontSize: 13,
    fontWeight: '600',
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.9,
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
    textAlign: 'center',
  },
});
