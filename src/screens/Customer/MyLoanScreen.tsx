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
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { ROUTES } from '../../constants/routes';
import * as customerApi from '../../services/api/customerApi';

export const MyLoanScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [myLoans, setMyLoans] = useState<customerApi.MyLoanResponse[]>([]);
  const [isLoansLoading, setIsLoansLoading] = useState(true);
  const [selectedLoanIndex, setSelectedLoanIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'summary'>('summary');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMyLoans = React.useCallback(async () => {
    setIsLoansLoading(true);
    try {
      const loans = await customerApi.getMyLoans();
      setMyLoans(loans);
      setSelectedLoanIndex(idx => Math.min(idx, Math.max((loans?.length ?? 1) - 1, 0)));
    } catch {
      setMyLoans([]);
    } finally {
      setIsLoansLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMyLoans();
  }, [loadMyLoans]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await loadMyLoans();
    setIsRefreshing(false);
  }, [loadMyLoans]);

  const selectedLoan = myLoans[selectedLoanIndex];

  // Derive display values from the new API shape
  const schedule = selectedLoan?.repayment_schedule ?? [];
  const totalLoanAmount = schedule.reduce((sum, s) => sum + s.amount, 0);
  const totalPaid = schedule.reduce((sum, s) => sum + (s.paid_amount ?? 0), 0);
  const totalBalance = schedule.reduce((sum, s) => sum + (s.balance ?? 0), 0);
  const completedInstallments = schedule.filter(s =>
    ['paid', 'completed'].includes(s.status?.toLowerCase()),
  ).length;
  const installmentCount = selectedLoan?.installment_count ?? 0;
  const percentPaid =
    totalLoanAmount > 0
      ? Math.min(100, Math.round((totalPaid / totalLoanAmount) * 100))
      : 0;
  const nextSchedule = schedule.find(
    s => !['paid', 'completed'].includes(s.status?.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="My Loan" showBack={false} showNotification={true} />

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
        {isRefreshing || isLoansLoading ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={50} borderRadius={18} style={{ marginBottom: 12 }} />
            <Skeleton height={220} borderRadius={18} style={{ marginBottom: 16 }} />
            <Skeleton height={50} borderRadius={25} style={{ marginBottom: 20 }} />
            <Skeleton height={200} borderRadius={16} style={{ marginBottom: 20 }} />
          </View>
        ) : (
          <>
            {myLoans.length === 0 ? (
              <View style={styles.emptyState}>
                <AppIcon name="file-text" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No active loans found</Text>
                <Text style={styles.emptyText}>
                  Your approved loans will appear here.
                </Text>
              </View>
            ) : (
              <>
                {/* Loan Filter — only shown if 2+ loans, equal width pills */}
                {myLoans.length > 1 && (
                  <View style={styles.loanSelector}>
                    {myLoans.map((item, index) => (
                      <TouchableOpacity
                        key={item.finance_id}
                        style={[
                          styles.loanSelectorItem,
                          index === selectedLoanIndex && styles.loanSelectorItemActive,
                        ]}
                        onPress={() => setSelectedLoanIndex(index)}
                      >
                        <Text
                          style={[
                            styles.loanSelectorText,
                            index === selectedLoanIndex && styles.loanSelectorTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {item.loan_package_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Hero Loan Card */}
                <LinearGradient
                  colors={['#083827', '#0D523B', '#126349']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.loanCard}
                >
                  <View style={styles.loanHeaderRow}>
                    <View>
                      <Text style={styles.cardHeaderTitle}>
                        {selectedLoan?.loan_package_name}
                      </Text>
                      <Text style={styles.cardHeaderSub}>
                        Loan ID: #{selectedLoan?.finance_id}
                      </Text>
                    </View>
                    <View style={styles.statusBadgePill}>
                      <Text style={styles.statusBadgeText}>Active</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.detailsList}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Loan Amount :</Text>
                      <Text style={styles.detailValue}>
                        {formatINR(totalLoanAmount)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Installments :</Text>
                      <Text style={styles.detailValue}>
                        {installmentCount} × {selectedLoan?.frequency}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Interest Rate :</Text>
                      <Text style={styles.detailValue}>
                        {selectedLoan?.interest_percentage}%
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Next Due Date :</Text>
                      <Text style={styles.detailValue}>
                        {nextSchedule ? formatDate(nextSchedule.due_date) : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailCta}>
                    <Text style={styles.detailCtaText}>
                      {completedInstallments} of {installmentCount} installments completed
                    </Text>
                  </View>
                </LinearGradient>

                {/* Segmented Pill Tabs: Summary first, then Schedule */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'summary' && styles.activeTabBtn]}
                    onPress={() => setActiveTab('summary')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.tabBtnText,
                        { color: activeTab === 'summary' ? '#FFFFFF' : '#64748B' },
                      ]}
                    >
                      Summary
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'details' && styles.activeTabBtn]}
                    onPress={() => setActiveTab('details')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.tabBtnText,
                        { color: activeTab === 'details' ? '#FFFFFF' : '#64748B' },
                      ]}
                    >
                      Schedule
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeTab === 'details' ? (
                  /* Repayment Schedule List */
                  <Card style={styles.scheduleCard} variant="flat" padding={0}>
                    {schedule.map((item, idx) => {
                      const isPaid = ['paid', 'completed'].includes(
                        item.status?.toLowerCase(),
                      );
                      const isLast = idx === schedule.length - 1;
                      return (
                        <View key={item.schedule_id}>
                          <View style={styles.scheduleRow}>
                            <View style={styles.scheduleLeft}>
                              <View
                                style={[
                                  styles.installmentCircle,
                                  isPaid && styles.installmentCirclePaid,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.installmentNo,
                                    isPaid && { color: '#FFFFFF' },
                                  ]}
                                >
                                  {item.installment}
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.scheduleDate}>
                                  {formatDate(item.due_date)}
                                </Text>
                                {item.paid_amount > 0 && (
                                  <Text style={styles.schedulePaidNote}>
                                    Paid: {formatINR(item.paid_amount)}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <View style={styles.scheduleRight}>
                              <Text style={styles.scheduleAmount}>
                                {formatINR(item.amount)}
                              </Text>
                              <View
                                style={[
                                  styles.scheduleBadge,
                                  {
                                    backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7',
                                    borderColor: isPaid ? '#86EFAC' : '#FDE68A',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.scheduleBadgeText,
                                    { color: isPaid ? '#15803D' : '#D97706' },
                                  ]}
                                >
                                  {isPaid ? 'Paid' : 'Pending'}
                                </Text>
                              </View>
                            </View>
                          </View>
                          {!isLast && <View style={styles.rowDivider} />}
                        </View>
                      );
                    })}
                  </Card>
                ) : (
                  /* Summary Tab */
                  <View style={styles.summaryContainer}>
                    {/* Progress Card */}
                    <Card style={styles.progressCard} variant="flat" padding={16}>
                      <View style={styles.progressHeaderRow}>
                        <Text style={styles.progressHeaderTitle}>
                          Repayment Progress
                        </Text>
                        <Text style={styles.progressPercentText}>
                          {percentPaid}% Paid
                        </Text>
                      </View>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${percentPaid}%` },
                          ]}
                        />
                      </View>
                      <View style={styles.progressSubRow}>
                        <Text style={styles.progressSubText}>
                          Paid:{' '}
                          <Text style={styles.paidValue}>{formatINR(totalPaid)}</Text>
                        </Text>
                        <Text style={styles.progressSubText}>
                          Balance:{' '}
                          <Text style={styles.remainingValue}>
                            {formatINR(totalBalance)}
                          </Text>
                        </Text>
                      </View>
                    </Card>

                    {/* Breakdown Card */}
                    <Card style={styles.breakdownCard} variant="flat" padding={16}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Total Loan</Text>
                        <Text style={styles.breakdownValue}>
                          {formatINR(totalLoanAmount)}
                        </Text>
                      </View>
                      <View style={styles.rowDivider} />
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Total Paid</Text>
                        <Text style={[styles.breakdownValue, styles.greenText]}>
                          {formatINR(totalPaid)}
                        </Text>
                      </View>
                      <View style={styles.rowDivider} />
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Remaining Balance</Text>
                        <Text style={[styles.breakdownValue, styles.amberText]}>
                          {formatINR(totalBalance)}
                        </Text>
                      </View>
                      <View style={styles.rowDivider} />
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>EMIs Completed</Text>
                        <Text style={styles.breakdownValue}>
                          {completedInstallments} of {installmentCount}
                        </Text>
                      </View>
                      <View style={styles.rowDivider} />
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Next Payment</Text>
                        <Text style={styles.breakdownValue}>
                          {nextSchedule ? formatDate(nextSchedule.due_date) : 'N/A'}
                        </Text>
                      </View>
                    </Card>

                    {/* Quick Action Links */}
                    <View style={styles.summaryActionsRow}>
                      <TouchableOpacity
                        style={styles.summaryActionBtn}
                        onPress={() => navigation.navigate(ROUTES.PAYMENT_SCHEDULE)}
                        activeOpacity={0.7}
                      >
                        <AppIcon name="calendar" size={15} color="#0D523B" />
                        <Text style={styles.summaryActionBtnText}>
                          View Payment History
                        </Text>
                        <AppIcon name="chevron-right" size={14} color="#0D523B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
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
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 90,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  loanSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  loanSelectorItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  loanSelectorItemActive: {
    borderColor: '#0D523B',
    backgroundColor: '#EAF5EE',
  },
  loanSelectorText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  loanSelectorTextActive: {
    color: '#0D523B',
  },
  loanCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  loanHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  cardHeaderSub: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadgePill: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  statusBadgeText: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 12,
  },
  detailsList: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#E0EDED',
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailCta: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 14,
    paddingTop: 11,
    alignItems: 'center',
  },
  detailCtaText: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 3,
    borderRadius: 20,
    marginBottom: 16,
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
  scheduleCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  installmentCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  installmentCirclePaid: {
    backgroundColor: '#10B981',
  },
  installmentNo: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  scheduleDate: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  schedulePaidNote: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  scheduleRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scheduleAmount: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  scheduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  scheduleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  breakdownCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  breakdownLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
  breakdownValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  summaryContainer: {
    gap: 14,
  },
  progressCard: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressHeaderTitle: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '800',
  },
  progressPercentText: {
    color: '#0D523B',
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSubText: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '500',
  },
  paidValue: {
    color: '#0D523B',
    fontWeight: '800',
  },
  remainingValue: {
    color: '#D97706',
    fontWeight: '800',
  },
  greenText: {
    color: '#0D523B',
  },
  amberText: {
    color: '#D97706',
  },
  summaryActionsRow: {
    gap: 10,
    marginTop: 4,
  },
  summaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summaryActionBtnText: {
    flex: 1,
    marginLeft: 10,
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
