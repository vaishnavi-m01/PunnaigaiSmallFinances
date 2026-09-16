import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, ScrollView, Modal, Platform, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import * as customerApi from '../../services/api/customerApi';
import { formatDate } from '../../utils/date';
import LinearGradient from 'react-native-linear-gradient';

type TimeFilter = 'Today' | 'Week' | 'Month' | 'Year';

const getDateRange = (filter: TimeFilter): { from_date: string; to_date: string } => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const to_date = fmt(now);
  let from = new Date(now);

  switch (filter) {
    case 'Today': break; 
    case 'Week':
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

export const PaymentHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialLoanId = route.params?.loanId;

  const [myLoans, setMyLoans] = useState<customerApi.MyLoanResponse[]>([]);
  const [historyData, setHistoryData] = useState<customerApi.PaymentHistoryRecord[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedLoans, setExpandedLoans] = useState<Record<string, boolean>>({});
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Month');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const timeOptions: TimeFilter[] = ['Today', 'Week', 'Month', 'Year'];

  const toggleExpand = (loanId: string) => {
    setExpandedLoans(prev => ({ ...prev, [loanId]: !prev[loanId] }));
  };

  const loadHistoryData = useCallback(async (filter: TimeFilter) => {
    try {
      const range = getDateRange(filter);
      const data = await customerApi.getPaymentHistory(range);
      setHistoryData(Array.isArray(data?.data) ? data.data : []);
      setTotalAmount(data?.total_payment ?? 0);
    } catch {
      setHistoryData([]);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const loans = await customerApi.getMyLoans();
      setMyLoans(loans);
      await loadHistoryData(timeFilter);
    } finally {
      setIsRefreshing(false);
    }
  }, [timeFilter, loadHistoryData]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      customerApi.getMyLoans(),
      loadHistoryData(timeFilter)
    ]).then(([loans]) => {
      if (mounted) {
        setMyLoans(loans);
        if (initialLoanId) {
          const found = loans.find(l => String(l.finance_id) === String(initialLoanId));
          if (found) {
            setActiveTab(String(found.finance_id));
          }
        }
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [initialLoanId, timeFilter, loadHistoryData]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Build Tabs: All Loans + each loan
  const tabs = [{ id: 'all', label: 'All Loans' }];
  myLoans.forEach(loan => {
    tabs.push({ id: String(loan.finance_id), label: loan.loan_package_name });
  });

  const getLoanIconColor = (name: string) => name.toLowerCase().includes('gold') ? '#8B5CF6' : '#10B981';
  const getLoanIconName = (name: string) => name.toLowerCase().includes('gold') ? 'lock' : 'user';

  const renderSingleLoanView = (loan: customerApi.MyLoanResponse) => {
    const accentColor = getLoanIconColor(loan.loan_package_name);
    const iconName = getLoanIconName(loan.loan_package_name);

    // Filter history for this loan based on API response
    const filteredHistory = historyData.filter(h => String(h.finance_id) === String(loan.finance_id));
    const filteredTotalAmount = filteredHistory.reduce((sum, h) => sum + Number(h.amount), 0);

    return (
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        <LinearGradient
          colors={[accentColor, accentColor + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.globalSummaryCard}
        >
          <View style={[styles.watermarkContainer, { top: -20, right: -10 }]}>
            <AppIcon name={iconName} size={150} color="rgba(255,255,255,0.08)" />
          </View>
          <View style={styles.globalSummaryMain}>
            <Text style={styles.globalSummaryLabelPremium}>{loan.loan_package_name} - Paid ({timeFilter})</Text>
            <Text style={styles.globalSummaryAmountPremium}>{formatINR(filteredTotalAmount)}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Transactions ({timeFilter})</Text>
        
        <View style={styles.listCard}>
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found for {timeFilter.toLowerCase()}.</Text>
            </View>
          ) : (
            filteredHistory.map((item, index) => {
              const isPaid = ['paid', 'completed', 'approved'].includes(item.status?.toLowerCase());
              const isLast = index === filteredHistory.length - 1;
              return (
                <View key={item.payment_id || index} style={[styles.historyRow, !isLast && styles.rowBorder]}>
                  <View style={styles.historyLeft}>
                    <AppIcon name={isPaid ? 'check-circle' : 'clock'} size={20} color={isPaid ? '#10B981' : '#F59E0B'} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.historyDate}>{formatDate(item.paid_at || (item as any).due_date)}</Text>
                      <Text style={styles.historySubtitle}>{item.mode ? item.mode.toUpperCase() : 'EMI Payment'}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.historyAmount}>{formatINR(Number(item.amount))}</Text>
                    <Text style={[styles.historyStatus, { color: isPaid ? '#10B981' : '#F59E0B' }]}>
                      {isPaid ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    );
  };

  const renderAllLoansView = () => {
    return (
      <View style={styles.content}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.globalSummaryCard}
        >
          <View style={[styles.watermarkContainer, { top: -20, right: -10 }]}>
            <AppIcon name="pie-chart" size={150} color="rgba(255,255,255,0.08)" />
          </View>
          <View style={styles.globalSummaryMain}>
            <Text style={styles.globalSummaryLabelPremium}>Total Amount ({timeFilter})</Text>
            <Text style={styles.globalSummaryAmountPremium}>{formatINR(totalAmount)}</Text>
          </View>
        </LinearGradient>

        <FlatList
          data={historyData.length === 0 ? [] : myLoans}
          keyExtractor={item => String(item.finance_id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />}
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { marginTop: 40 }]}>
              <AppIcon name="file-text" size={48} color="#E2E8F0" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>
                {myLoans.length === 0 
                  ? 'No active loans found.' 
                  : `No payment history found for ${timeFilter.toLowerCase()}.`}
              </Text>
            </View>
          }
          renderItem={({ item: loan }) => {
            const filteredHistory = historyData.filter(h => String(h.finance_id) === String(loan.finance_id));
            if (filteredHistory.length === 0) return null; // Don't show loans with no transactions in this filter

            const accentColor = getLoanIconColor(loan.loan_package_name);
            const iconName = getLoanIconName(loan.loan_package_name);
            
            return (
              <View style={styles.loanGroupCard}>
                <View style={styles.loanGroupHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.iconCircle, { backgroundColor: accentColor + '15', width: 24, height: 24 }]}>
                      <AppIcon name={iconName} size={12} color={accentColor} />
                    </View>
                    <Text style={[styles.loanGroupTitle, { color: '#0F172A', marginLeft: 8 }]}>
                      {loan.loan_package_name}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.loanGroupList}>
                  {(() => {
                    const isExpanded = expandedLoans[String(loan.finance_id)] || false;
                    const itemsToShow = isExpanded ? filteredHistory : filteredHistory.slice(0, 3);
                    const hasMore = filteredHistory.length > 3;

                    return (
                      <>
                        {itemsToShow.map((item, index) => {
                          const isPaid = ['paid', 'completed', 'approved'].includes(item.status?.toLowerCase());
                          return (
                            <View key={item.payment_id || index} style={styles.historyRowCompact}>
                              <View style={styles.historyLeft}>
                                <AppIcon name={isPaid ? 'check-circle' : 'clock'} size={16} color={isPaid ? '#10B981' : '#F59E0B'} />
                                <View style={{ marginLeft: 10 }}>
                                  <Text style={styles.historyDate}>{formatDate(item.paid_at || (item as any).due_date)}</Text>
                                </View>
                              </View>
                              <Text style={styles.historySubtitle}>{item.mode ? item.mode.toUpperCase() : 'EMI'}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', width: 90, justifyContent: 'space-between' }}>
                                <Text style={styles.historyAmountCompact}>{formatINR(Number(item.amount))}</Text>
                                <Text style={[styles.historyStatusCompact, { color: isPaid ? '#10B981' : '#F59E0B' }]}>
                                  {isPaid ? 'Paid' : 'Pending'}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                        {hasMore && (
                          <TouchableOpacity 
                            style={styles.viewMoreBtn} 
                            onPress={() => toggleExpand(String(loan.finance_id))}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.viewMoreBtnText}>
                              {isExpanded ? 'Hide transactions' : `View ${filteredHistory.length - 3} more`}
                            </Text>
                            <AppIcon name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color="#10B981" />
                          </TouchableOpacity>
                        )}
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

  const renderHeaderRight = () => (
    <View style={{ zIndex: 10 }}>
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>{timeFilter}</Text>
        <AppIcon name="chevron-down" size={12} color="#64748B" />
      </TouchableOpacity>
      
      {dropdownVisible && (
        <Modal transparent animationType="fade" visible={dropdownVisible} onRequestClose={() => setDropdownVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
            <View style={styles.dropdownMenu}>
              {timeOptions.map((opt, index) => {
                const isLast = index === timeOptions.length - 1;
                return (
                  <TouchableOpacity 
                    key={opt}
                    style={[styles.dropdownMenuItem, !isLast && { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }, timeFilter === opt && styles.dropdownMenuItemActive]}
                    onPress={() => { setTimeFilter(opt); setDropdownVisible(false); }}
                  >
                    <Text style={[styles.dropdownMenuItemText, timeFilter === opt && styles.dropdownMenuItemTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Payment History" showBack={true} rightComponent={renderHeaderRight()} />

      {myLoans.length > 1 && (
        <View style={{ marginTop: 8, marginBottom: 0 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {activeTab === 'all' ? renderAllLoansView() : renderSingleLoanView(myLoans.find(l => String(l.finance_id) === activeTab)!)}

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
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 85,
  },
  dropdownButtonText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 60,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: 140,
    overflow: 'hidden',
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#ECFDF5',
  },
  dropdownMenuItemText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownMenuItemTextActive: {
    color: '#10B981',
    fontWeight: '800',
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  tabText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  
  // Single Loan View Styles
  miniCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  watermarkContainer: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 0,
  },
  miniCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    zIndex: 1,
  },
  miniCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCardTitlePremium: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
  miniCardAmountPremium: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginTop: 2 },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '800' },
  progressLabelPremium: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', marginBottom: 8, zIndex: 1 },
  progressBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden', zIndex: 1 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressValueTextPremium: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', zIndex: 1 },
  
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    paddingBottom: 0,
    flex: 1,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
  historySubtitle: { color: '#64748B', fontSize: 11, fontWeight: '500', marginTop: 2 },
  historyAmount: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
  historyStatus: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  
  viewAllBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  viewAllBtnText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },

  // All Loans View Styles
  globalSummaryCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  globalSummaryMain: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  globalSummaryLabelPremium: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginBottom: 4, zIndex: 1 },
  globalSummaryAmountPremium: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', zIndex: 1 },
  
  loanGroupCard: {
    marginBottom: 16,
  },
  loanGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  loanGroupTitle: { fontSize: 13, fontWeight: '800' },
  loanGroupList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  historyRowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyAmountCompact: { color: '#0F172A', fontSize: 12, fontWeight: '700' },
  historyStatusCompact: { fontSize: 11, fontWeight: '700' },
  
  viewMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewMoreBtnText: { color: '#10B981', fontSize: 12, fontWeight: '600' },

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
