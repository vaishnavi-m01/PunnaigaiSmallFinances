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

import LinearGradient from 'react-native-linear-gradient';

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

  const getLoanIconColor = (name: string) => {
    return name.toLowerCase().includes('gold') ? '#8B5CF6' : '#10B981';
  };

  const getLoanGradient = (name: string) => {
    return name.toLowerCase().includes('gold') ? ['#8B5CF6', '#6D28D9'] : ['#10B981', '#047857'];
  };

  const getLoanIconName = (name: string) => {
    return name.toLowerCase().includes('gold') ? 'lock' : 'shield'; 
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="My Loans" showBack={false} showNotification={true} />

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
            <Skeleton height={240} borderRadius={24} style={{ marginBottom: 16 }} />
            <Skeleton height={240} borderRadius={24} style={{ marginBottom: 16 }} />
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

                  const accentColor = getLoanIconColor(loan.loan_package_name);
                  const gradientColors = getLoanGradient(loan.loan_package_name);
                  const iconName = getLoanIconName(loan.loan_package_name);

                  return (
                    <TouchableOpacity 
                      key={loan.finance_id} 
                      activeOpacity={0.9}
                      onPress={() => navigation.navigate(ROUTES.LOAN_DETAILS, { loanId: loan.finance_id })}
                    >
                      <LinearGradient
                        colors={['#047857', '#064E3B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.loanCardPremium}
                      >
                        <View style={styles.watermarkContainer}>
                          <AppIcon name={iconName} size={150} color="rgba(255,255,255,0.08)" />
                        </View>
                        
                        {/* Top Header */}
                        <View style={styles.cardHeaderRow}>
                          <View style={styles.cardHeaderLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                              <AppIcon name={iconName} size={20} color="#FFFFFF" />
                            </View>
                            <View>
                              <Text style={styles.loanNamePremium}>{loan.loan_package_name}</Text>
                              <Text style={styles.loanIdPremium}>Loan No : {loan.finance_id}</Text>
                            </View>
                          </View>
                          <View style={styles.cardHeaderRight}>
                            <View style={[styles.activeBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                              <Text style={[styles.activeBadgeText, { color: '#FFFFFF' }]}>Active</Text>
                            </View>
                          </View>
                        </View>

                        {/* Amounts & Tenure */}
                        <View style={styles.amountsRow}>
                          <View>
                            <Text style={styles.amountTextPremium}>{formatINR(totalLoanAmount)}</Text>
                            <Text style={styles.amountLabelPremium}>Total Loan Amount</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.tenureTextPremium}>
                              {installmentCount} {loan.frequency}
                            </Text>
                            <Text style={styles.amountLabelPremium}>Tenure</Text>
                          </View>
                        </View>

                        {/* Progress Bar Area */}
                        <View style={styles.progressArea}>
                          <Text style={styles.progressLabelPremium}>
                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Paid </Text> 
                            <Text style={{ color: '#FFFFFF' }}>{completedInstallments}</Text> 
                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}> of {installmentCount} EMI</Text>
                          </Text>
                          <View style={[styles.progressBarTrack, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${percentPaid}%`, backgroundColor: '#FFFFFF' },
                              ]}
                            />
                          </View>
                          <View style={styles.progressValuesRow}>
                            <Text style={styles.progressValueTextPremium}>
                              <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{formatINR(totalPaid)}</Text> / {formatINR(totalLoanAmount)}
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
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
  loanCardPremium: {
    marginBottom: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  watermarkContainer: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  loanNamePremium: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  loanIdPremium: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 1,
  },
  amountTextPremium: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  amountLabelPremium: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tenureTextPremium: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  progressArea: {
    marginBottom: 4,
    zIndex: 1,
  },
  progressLabelPremium: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressValueTextPremium: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
});
