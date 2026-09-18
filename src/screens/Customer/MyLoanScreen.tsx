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
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import * as customerApi from '../../services/api/customerApi';

export const MyLoanScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [myLoans, setMyLoans] = useState<customerApi.MyLoanResponse[]>([]);
  const [isLoansLoading, setIsLoansLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMyLoans = React.useCallback(async () => {
    setIsLoansLoading(true);
    try {
      const loans = await customerApi.getMyLoans();
      setMyLoans(loans);
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

  const getLoanTheme = (name: string) => {
    const isGold = name.toLowerCase().includes('gold');
    return {
      primary: isGold ? '#8B5CF6' : '#10B981',
      bgLight: isGold ? '#F5F3FF' : '#ECFDF5',
      icon: isGold ? 'lock' : 'user',
    };
  };

  const getLoanNo = (loan: customerApi.MyLoanResponse) => {
    const isGold = loan.loan_package_name.toLowerCase().includes('gold');
    return `${isGold ? 'GL' : 'PL'}202500${loan.finance_id}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="My Loans" showBack={false} showNotification={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {isRefreshing || isLoansLoading ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={260} borderRadius={24} style={{ marginBottom: 16 }} />
            <Skeleton height={260} borderRadius={24} style={{ marginBottom: 16 }} />
          </View>
        ) : (
          <>
            {myLoans.length === 0 ? (
              <View style={styles.emptyState}>
                <AppIcon name="file-text" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No active loans found</Text>
                <Text style={styles.emptyText}>Your approved loans will appear here.</Text>
              </View>
            ) : (
              <View style={styles.loansList}>
                {myLoans.map(loan => {
                  const schedule = loan.repayment_schedule ?? [];
                  const totalLoanAmount = schedule.reduce((sum, s) => sum + s.amount, 0);
                  const totalPaid = schedule.reduce((sum, s) => sum + (s.paid_amount ?? 0), 0);
                  const completedInstallments = schedule.filter(s =>
                    ['paid', 'completed'].includes(s.status?.toLowerCase()),
                  ).length;
                  const installmentCount = loan.installment_count ?? 0;
                  const percentPaid =
                    totalLoanAmount > 0
                      ? Math.min(100, Math.round((totalPaid / totalLoanAmount) * 100))
                      : 0;

                  const theme = getLoanTheme(loan.loan_package_name);
                  const loanNo = getLoanNo(loan);

                  return (
                    <View key={loan.finance_id} style={styles.loanCard}>
                      {/* Header */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeaderLeft}>
                          <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
                            <AppIcon name={theme.icon} size={20} color="#FFFFFF" />
                          </View>
                          <View>
                            <Text style={styles.loanName}>{loan.loan_package_name}</Text>
                            <Text style={styles.loanId}>Loan No : {loanNo}</Text>
                          </View>
                        </View>
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      </View>

                      {/* Details Row */}
                      <View style={styles.amountsRow}>
                        <View>
                          <Text style={styles.amountText}>{formatINR(totalLoanAmount)}</Text>
                          <Text style={styles.amountLabel}>Total Loan Amount</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.tenureText}>
                            {installmentCount} {loan.frequency}
                          </Text>
                          <Text style={styles.amountLabel}>Tenure</Text>
                        </View>
                      </View>

                      {/* Progress Area */}
                      <View style={styles.progressArea}>
                        <Text style={styles.progressLabel}>
                          <Text style={{ color: '#64748B' }}>Paid </Text>
                          <Text style={{ color: '#0F172A' }}>{completedInstallments}</Text>
                          <Text style={{ color: '#64748B' }}> of {installmentCount} EMI</Text>
                        </Text>
                        
                        <View style={styles.progressBarTrack}>
                          <View style={[styles.progressBarFill, { width: `${percentPaid}%`, backgroundColor: theme.primary }]} />
                        </View>
                        
                        <Text style={styles.progressValues}>
                          <Text style={{ color: '#0F172A', fontWeight: '800' }}>{formatINR(totalPaid)}</Text> / {formatINR(totalLoanAmount)}
                        </Text>
                      </View>

                      {/* Action Button */}
                      <TouchableOpacity
                        style={styles.viewDetailsButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate(ROUTES.LOAN_DETAILS, { loanId: loan.finance_id })}
                      >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
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
    backgroundColor: '#F8FAFC',
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
  loansList: {
    paddingBottom: 20,
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loanName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  loanId: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
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
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  amountText: {
    color: '#0D523B',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  amountLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tenureText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  progressArea: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValues: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  viewDetailsButton: {
    backgroundColor: '#0D523B',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
