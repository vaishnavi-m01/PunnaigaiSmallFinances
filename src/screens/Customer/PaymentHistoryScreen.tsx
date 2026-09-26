import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import * as customerApi from '../../services/api/customerApi';
import { formatDate } from '../../utils/date';

export const PaymentHistoryScreen: React.FC = () => {
  // const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialLoanId = route.params?.loanId;

  const [myLoans, setMyLoans] = useState<customerApi.MyLoanResponse[]>([]);
  const [historyData, setHistoryData] = useState<
    customerApi.PaymentHistoryRecord[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedLoans, setExpandedLoans] = useState<Record<string, boolean>>(
    {},
  );

  const toggleExpand = (loanId: string) => {
    setExpandedLoans(prev => ({ ...prev, [loanId]: !prev[loanId] }));
  };

  const loadHistoryData = useCallback(async () => {
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const to_date = fmt(new Date(now.getFullYear(), 11, 31));
      const from = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );

      const data = await customerApi.getPaymentHistory({
        from_date: fmt(from),
        to_date,
      });
      setHistoryData(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setHistoryData([]);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const loans = await customerApi.getMyLoans();
      setMyLoans(loans);
      await loadHistoryData();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadHistoryData]);

  useEffect(() => {
    let mounted = true;
    Promise.all([customerApi.getMyLoans(), loadHistoryData()])
      .then(([loans]) => {
        if (mounted) {
          setMyLoans(loans);
          if (initialLoanId) {
            const found = loans.find(
              l => String(l.finance_id) === String(initialLoanId),
            );
            if (found) {
              setActiveTab(String(found.finance_id));
            }
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [initialLoanId, loadHistoryData]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#0D523B" />
      </View>
    );
  }

  // Build Tabs: All Loans + each loan
  const tabs = [{ id: 'all', label: 'All Loans' }];
  myLoans.forEach(loan => {
    tabs.push({ id: String(loan.finance_id), label: loan.loan_package_name });
  });

  const getLoanTheme = (name: string) => {
    const isGold = name.toLowerCase().includes('gold');
    return {
      primary: isGold ? '#8B5CF6' : '#0D523B',
      icon: isGold ? 'lock' : 'user',
      prefix: isGold ? 'GL' : 'PL',
    };
  };

  const renderSingleLoanView = (loan: customerApi.MyLoanResponse) => {
    const theme = getLoanTheme(loan.loan_package_name);
    const loanNo = `${theme.prefix}202500${loan.finance_id}`;

    const filteredHistory = historyData.filter(
      h => String(h.finance_id) === String(loan.finance_id),
    );

    // Progress calculation
    const schedule = loan.repayment_schedule ?? [];
    const totalLoanAmount = schedule.reduce((sum, s) => sum + s.amount, 0);
    const totalPaid = schedule.reduce(
      (sum, s) => sum + (s.paid_amount ?? 0),
      0,
    );
    const completedInstallments = schedule.filter(s =>
      ['paid', 'completed'].includes(s.status?.toLowerCase()),
    ).length;
    const installmentCount = loan.installment_count ?? 0;
    const percentPaid =
      totalLoanAmount > 0
        ? Math.min(100, Math.round((totalPaid / totalLoanAmount) * 100))
        : 0;

    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0D523B"
          />
        }
      >
        <View style={styles.miniSummaryCard}>
          <View style={styles.miniSummaryTopRow}>
            <View style={styles.miniSummaryLeft}>
              <View
                style={[
                  styles.miniIconCircle,
                  { backgroundColor: theme.primary },
                ]}
              >
                <AppIcon name={theme.icon} size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.miniLoanName}>
                  {loan.loan_package_name}
                </Text>
                <Text style={styles.miniAmount}>
                  {formatINR(totalLoanAmount)}
                </Text>
              </View>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>

          <Text style={styles.progressLabel}>
            <Text style={{ color: '#64748B' }}>Paid </Text>
            <Text style={{ color: '#0F172A' }}>{completedInstallments}</Text>
            <Text style={{ color: '#64748B' }}> of {installmentCount} EMI</Text>
          </Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percentPaid}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>
          <Text style={styles.progressAmountRow}>
            {formatINR(totalPaid)} / {formatINR(totalLoanAmount)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Payment History</Text>

        <View style={styles.listCard}>
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found.</Text>
            </View>
          ) : (
            filteredHistory.map((item, index) => {
              const isPaid = ['paid', 'completed', 'approved'].includes(
                item.status?.toLowerCase(),
              );
              const isLast = index === filteredHistory.length - 1;
              return (
                <View
                  key={item.payment_id || index}
                  style={[styles.historyRow, !isLast && styles.rowBorder]}
                >
                  <View style={styles.historyLeft}>
                    <AppIcon
                      name={isPaid ? 'check-circle' : 'clock'}
                      size={20}
                      color={isPaid ? '#10B981' : '#F59E0B'}
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.historyDate}>
                        {formatDate(item.paid_at || (item as any).due_date)}
                      </Text>
                      <Text style={styles.historySubtitle}>
                        {item.mode ? item.mode.toUpperCase() : 'EMI Payment'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.historyAmount}>
                      {formatINR(Number(item.amount))}
                    </Text>
                    <Text
                      style={[
                        styles.historyStatus,
                        { color: isPaid ? '#10B981' : '#F59E0B' },
                      ]}
                    >
                      {isPaid ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
          {filteredHistory.length > 0 && (
            <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.8}>
              <Text style={styles.viewAllBtnText}>View All Transactions</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderAllLoansView = () => {
    // Calculate global stats
    let grandTotalPaid = 0;
    let globalCompletedEMIs = 0;
    let globalTotalEMIs = 0;

    myLoans.forEach(loan => {
      const schedule = loan.repayment_schedule ?? [];
      grandTotalPaid += schedule.reduce(
        (sum, s) => sum + (s.paid_amount ?? 0),
        0,
      );
      globalCompletedEMIs += schedule.filter(s =>
        ['paid', 'completed'].includes(s.status?.toLowerCase()),
      ).length;
      globalTotalEMIs += loan.installment_count ?? 0;
    });

    return (
      <View style={styles.content}>
        {/* Global Summary Card */}
        <View style={styles.globalSummaryCard}>
          <View style={styles.globalSummaryCol}>
            <Text style={styles.globalSummaryLabel}>
              Total Paid (Both Loans)
            </Text>
            <Text style={styles.globalSummaryAmount}>
              {formatINR(grandTotalPaid)}
            </Text>
          </View>
          <View style={styles.globalSummaryColRight}>
            <Text style={styles.globalSummaryLabel}>Total EMIs</Text>
            <Text style={styles.globalSummarySubAmount}>
              {globalCompletedEMIs} / {globalTotalEMIs}
            </Text>
          </View>
        </View>

        <FlatList
          data={historyData.length === 0 ? [] : myLoans}
          keyExtractor={item => String(item.finance_id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#0D523B"
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { marginTop: 40 }]}>
              <AppIcon
                name="file-text"
                size={48}
                color="#E2E8F0"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyText}>No payment history found.</Text>
            </View>
          }
          renderItem={({ item: loan }) => {
            const filteredHistory = historyData.filter(
              h => String(h.finance_id) === String(loan.finance_id),
            );
            if (filteredHistory.length === 0) return null;

            const theme = getLoanTheme(loan.loan_package_name);
            const loanNo = `${theme.prefix}202500${loan.finance_id}`;

            return (
              <View style={styles.loanGroupCard}>
                <View style={styles.loanGroupHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.groupIconCircle,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <AppIcon name={theme.icon} size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.loanGroupTitle}>
                      {loan.loan_package_name}{' '}
                      <Text style={{ color: '#64748B', fontWeight: '500' }}>
                        ({loanNo})
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                </View>

                <View style={styles.listCard}>
                  {(() => {
                    const itemsToShow = filteredHistory;

                    return (
                      <>
                        {itemsToShow.map((item, index) => {
                          const isPaid = [
                            'paid',
                            'completed',
                            'approved',
                          ].includes(item.status?.toLowerCase());
                          const isLast = index === itemsToShow.length - 1;
                          return (
                            <View
                              key={item.payment_id || index}
                              style={[
                                styles.historyRow,
                                !isLast && styles.rowBorder,
                                { paddingVertical: 12 },
                              ]}
                            >
                              <View style={styles.historyLeft}>
                                <AppIcon
                                  name={isPaid ? 'check-circle' : 'clock'}
                                  size={18}
                                  color={isPaid ? '#10B981' : '#F59E0B'}
                                />
                                <View style={{ marginLeft: 10 }}>
                                  <Text style={styles.historyDate}>
                                    {formatDate(
                                      item.paid_at || (item as any).due_date,
                                    )}
                                  </Text>
                                  <Text style={styles.historySubtitle}>
                                    {item.mode
                                      ? item.mode.toUpperCase()
                                      : 'EMI Payment'}
                                  </Text>
                                </View>
                              </View>
                              <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.historyAmountCompact}>
                                  {formatINR(Number(item.amount))}
                                </Text>
                                <Text
                                  style={[
                                    styles.historyStatusCompact,
                                    { color: isPaid ? '#10B981' : '#F59E0B' },
                                  ]}
                                >
                                  {isPaid ? 'Paid' : 'Pending'}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </>
                    );
                  })()}
                </View>
              </View>
            );
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Payment History" showBack={true} />

      {myLoans.length > 1 && (
        <View style={{ marginTop: 12, marginBottom: 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              // Add loan ID to tab label if not "all"
              let label = tab.label;
              if (tab.id !== 'all') {
                const theme = getLoanTheme(tab.label);
                label = `${tab.label} (${theme.prefix}202500${tab.id})`;
              }
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text
                    style={[styles.tabText, isActive && styles.tabTextActive]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {activeTab === 'all'
        ? renderAllLoansView()
        : renderSingleLoanView(
            myLoans.find(l => String(l.finance_id) === activeTab)!,
          )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Tabs
  tabsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: '#0D523B',
    borderColor: '#0D523B',
  },
  tabText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Single Loan View Styles
  miniSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  miniSummaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  miniSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniLoanName: { color: '#0F172A', fontSize: 14, fontWeight: '800' },
  miniAmount: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },

  activeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  activeBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  progressLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressAmountRow: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginLeft: 4,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
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
  historySubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  historyAmount: { color: '#0F172A', fontSize: 14, fontWeight: '800' },
  historyStatus: { fontSize: 11, fontWeight: '800', marginTop: 2 },

  viewAllBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  viewAllBtnText: {
    color: '#0D523B',
    fontSize: 14,
    fontWeight: '800',
  },

  // All Loans View Styles
  globalSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  globalSummaryCol: {
    flex: 1,
  },
  globalSummaryColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  globalSummaryLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  globalSummaryAmount: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  globalSummarySubAmount: { color: '#0F172A', fontSize: 18, fontWeight: '800' },

  loanGroupCard: {
    marginBottom: 24,
  },
  loanGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  groupIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  loanGroupTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  historyAmountCompact: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
  historyStatusCompact: { fontSize: 11, fontWeight: '800' },

  viewMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 16,
    paddingBottom: 4,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewMoreBtnText: { color: '#0D523B', fontSize: 13, fontWeight: '700' },

  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
