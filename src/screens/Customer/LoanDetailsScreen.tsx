import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { AppIcon } from '../../component/AppIcon';
import { Header } from '../../component/Header';
import { Skeleton } from '../../component/Common/Skeleton';
import * as customerApi from '../../services/api/customerApi';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { ROUTES } from '../../constants/routes';

export const LoanDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const loanId = Number(route.params?.loanId || 1);

  const [detail, setDetail] = useState<customerApi.LoanDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadData = React.useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await customerApi.getLoanDetail(loanId);
        setDetail(result);
        setHasError(false);
      } catch {
        setHasError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loanId],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = React.useCallback(() => {
    loadData(true);
  }, [loadData]);

  const renderContent = () => {
    if (loading || refreshing || !detail) {
      if (hasError && !loading && !refreshing) {
        return (
          <View style={[styles.centerState, { marginTop: 100 }]}>
            <AppIcon name="alert-circle" size={28} color="#EF4444" />
            <Text style={styles.stateText}>Unable to load loan details</Text>
          </View>
        );
      }
      return (
        <View style={{ marginTop: 16 }}>
          <Skeleton
            height={140}
            borderRadius={12}
            style={{ marginBottom: 16 }}
          />
          <View style={styles.gridContainer}>
            <Skeleton
              width="48%"
              height={80}
              borderRadius={12}
              style={{ marginBottom: 12 }}
            />
            <Skeleton
              width="48%"
              height={80}
              borderRadius={12}
              style={{ marginBottom: 12 }}
            />
            <Skeleton
              width="48%"
              height={80}
              borderRadius={12}
              style={{ marginBottom: 12 }}
            />
            <Skeleton
              width="48%"
              height={80}
              borderRadius={12}
              style={{ marginBottom: 12 }}
            />
          </View>
          <Skeleton
            height={100}
            borderRadius={12}
            style={{ marginBottom: 16 }}
          />
          <Skeleton height={200} borderRadius={12} />
        </View>
      );
    }

    const totalLoanAmount = detail.total_amount
      ? Number(detail.total_amount)
      : detail.repayment_schedules.reduce(
          (sum, s) => sum + Number(s.amount),
          0,
        );
    const totalPaid = detail.paid_amount
      ? Number(detail.paid_amount)
      : detail.repayment_schedules.reduce(
          (sum, s) => sum + Number(s.paid_amount || 0),
          0,
        );
    const remaining = detail.outstanding_amount
      ? Number(detail.outstanding_amount)
      : totalLoanAmount - totalPaid;
    const nextEMI = detail.repayment_schedules.find(
      s => !['paid', 'completed'].includes(s.status.toLowerCase()),
    );

    const isGold = detail.loan_package.name.toLowerCase().includes('gold');
    const gradientColors = isGold
      ? ['#8B5CF6', '#6D28D9']
      : ['#10B981', '#047857'];
    const loanIcon = isGold ? 'lock' : 'user';
    const prefix = isGold ? 'GL' : 'PL';
    const loanNo = `${prefix}202500${loanId}`;

    return (
      <>
        {/* Top Hero Gradient Card */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroLeft}>
              <View
                style={[
                  styles.heroIconCircle,
                  { backgroundColor: 'rgba(255,255,255,0.2)' },
                ]}
              >
                <AppIcon name={loanIcon} size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.heroTitle}>{detail.loan_package.name}</Text>
                <Text style={styles.heroSubtitle}>Loan No: {loanNo}</Text>
              </View>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Active</Text>
            </View>
          </View>

          <View style={styles.heroAmountContainer}>
            <Text style={styles.heroAmountLabel}>Total Loan Amount</Text>
            <Text style={styles.heroAmount}>{formatINR(totalLoanAmount)}</Text>
          </View>
        </LinearGradient>

        {/* Premium Grid Details */}
        <Text style={styles.sectionTitle}>Loan Terms</Text>
        <View style={styles.gridContainer}>
          <GridItem
            icon="clock"
            label="Tenure"
            value={`${detail.loan_package.installment_count} ${detail.loan_package.repayment_frequency}`}
          />
          <GridItem
            icon="arrow-down-circle"
            label="EMI"
            value={formatINR(detail.repayment_schedules[0]?.amount || 0)}
          />
          <GridItem
            icon="calendar"
            label="Starts"
            value={formatDate(
              detail.repayment_schedules[0]?.due_date ||
                new Date().toISOString(),
            )}
          />
        </View>

        {/* Loan Summary - Side by Side */}
        <Text style={styles.sectionTitle}>Payment Overview</Text>
        <View style={styles.summaryContainer}>
          <View
            style={[
              styles.summaryBox,
              { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
            ]}
          >
            <AppIcon name="check-circle" size={20} color="#16A34A" />
            <Text style={styles.summaryBoxLabel}>Total Paid</Text>
            <Text style={[styles.summaryBoxValue, { color: '#166534' }]}>
              {formatINR(totalPaid)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryBox,
              { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
            ]}
          >
            <AppIcon name="clock" size={20} color="#DC2626" />
            <Text style={styles.summaryBoxLabel}>Remaining</Text>
            <Text style={[styles.summaryBoxValue, { color: '#991B1B' }]}>
              {formatINR(remaining)}
            </Text>
          </View>
        </View>

        {/* Payment Schedule */}
        <View style={styles.scheduleHeader}>
          <Text style={styles.sectionTitle}>Installments</Text>
          {detail.repayment_schedules.filter(s => s.status === 'pending')
            .length > 0 && (
            <Text style={styles.pendingText}>
              {
                detail.repayment_schedules.filter(s => s.status === 'pending')
                  .length
              }{' '}
              Pending
            </Text>
          )}
        </View>

        <View style={styles.scheduleCard}>
          {detail.repayment_schedules.map((schedule, index) => {
            const statusLower = schedule.status
              ? schedule.status.toLowerCase()
              : 'unknown';
            const isPending = statusLower === 'pending';
            const isOverdue = statusLower === 'overdue';

            return (
              <View
                key={`sched_${schedule.id}`}
                style={[
                  styles.historyRow,
                  index !== detail.repayment_schedules.length - 1 &&
                    styles.rowBorder,
                  isOverdue && {
                    backgroundColor: '#FEF2F2',
                    paddingHorizontal: 12,
                    borderRadius: 8,
                  },
                ]}
              >
                <View style={styles.historyLeft}>
                  <AppIcon
                    name={
                      isOverdue
                        ? 'alert-triangle'
                        : isPending
                        ? 'clock'
                        : 'check-circle'
                    }
                    size={20}
                    color={
                      isOverdue ? '#EF4444' : isPending ? '#F59E0B' : '#10B981'
                    }
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.historyDate}>
                      {formatDate(schedule.due_date)}
                    </Text>
                    <Text style={styles.historySubtitle}>EMI Payment</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.historyAmount}>
                    {formatINR(schedule.amount)}
                  </Text>
                  <Text
                    style={[
                      styles.historyStatus,
                      {
                        color: isOverdue
                          ? '#EF4444'
                          : isPending
                          ? '#F59E0B'
                          : '#10B981',
                      },
                    ]}
                  >
                    {schedule.status
                      ? schedule.status.toUpperCase()
                      : 'UNKNOWN'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* View Payment History Button */}
        <TouchableOpacity
          style={styles.outlineButton}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(ROUTES.CUSTOMER_TABS, {
              screen: ROUTES.PAYMENT_SCHEDULE,
            })
          }
        >
          <AppIcon name="list" size={18} color="#FFFFFF" />
          <Text style={styles.outlineButtonText}>Full Payment History</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Loan Details"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const GridItem = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.gridItem}>
    <View style={styles.gridIconCircle}>
      <AppIcon name={icon} size={14} color="#0D523B" />
    </View>
    <View style={styles.gridContent}>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={styles.gridValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stateText: { marginTop: 12, color: '#64748B', fontSize: 14 },
  content: { padding: 16, paddingBottom: 100 },

  heroCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroAmountContainer: {
    marginTop: 8,
  },
  heroAmountLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginLeft: 4,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: { flex: 1 },
  gridLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  gridValue: { color: '#0F172A', fontSize: 13, fontWeight: '800' },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryBox: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  summaryBoxLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },
  summaryBoxValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  pendingText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  historySubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0D523B',
    marginBottom: 20,
    gap: 6,
  },
  outlineButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
