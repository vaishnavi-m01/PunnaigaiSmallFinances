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
import { useAppSelector } from '../../hooks/useAppHooks';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';

/**
 * Screen 5: My Loan Screen
 * Flat, clean, dark forest green loan card, segmented pill toggle [ Loan Details ] / [ Summary ],
 * and financial breakdown card. Zero drop shadows.
 */
export const MyLoanScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const loan = useAppSelector(state => state.customer.loan);

  const [activeTab, setActiveTab] = useState<'details' | 'summary'>('details');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const totalRepayment = loan.totalRepaymentAmount || 100000;
  const amountPaid = loan.amountReceived || 88000;
  const remainingAmount = Math.max(0, totalRepayment - amountPaid);
  const percentPaid = Math.min(100, Math.round((amountPaid / totalRepayment) * 100));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="My Loan" showBack={false} showNotification={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={220} borderRadius={18} style={{ marginBottom: 16 }} />
            <Skeleton height={50} borderRadius={25} style={{ marginBottom: 20 }} />
            <Skeleton height={200} borderRadius={16} style={{ marginBottom: 20 }} />
          </View>
        ) : (
          <>
            {/* Emerald Loan Details Hero Card */}
            <LinearGradient
              colors={['#083827', '#0D523B', '#126349']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loanCard}
            >
              <View style={styles.loanHeaderRow}>
                <View>
                  <Text style={styles.cardHeaderTitle}>Loan Details</Text>
                  <Text style={styles.cardHeaderSub}>Loan ID: {loan.loanId || 'PLN000123'}</Text>
                </View>
                <View style={styles.statusBadgePill}>
                  <Text style={styles.statusBadgeText}>Active</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Key-Value Details */}
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Package :</Text>
                  <Text style={styles.detailValue}>{loan.packageName || 'Gold Loan'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Loan Amount :</Text>
                  <Text style={styles.detailValue}>{formatINR(loan.loanAmount || 100000)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount Disbursed :</Text>
                  <Text style={styles.detailValue}>{formatINR(loan.amountDisbursed || 80000)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tenure :</Text>
                  <Text style={styles.detailValue}>{loan.tenureMonths || 12} Months</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status :</Text>
                  <Text style={[styles.detailValue, { color: '#86EFAC' }]}>Active</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Segmented Pill Tabs: [ Loan Details ] | [ Summary ] */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'details' && styles.activeTabBtn,
                ]}
                onPress={() => setActiveTab('details')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: activeTab === 'details' ? '#FFFFFF' : '#64748B' },
                  ]}
                >
                  Loan Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'summary' && styles.activeTabBtn,
                ]}
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
            </View>

            {activeTab === 'details' ? (
              /* Financial Breakdown Card for Loan Details */
              <Card style={styles.breakdownCard} variant="flat" padding={16}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Amount Received</Text>
                  <Text style={styles.breakdownValue}>
                    {formatINR(loan.amountReceived || 88000)}
                  </Text>
                </View>

                <View style={styles.rowDivider} />

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Total Repayment Amount</Text>
                  <Text style={styles.breakdownValue}>
                    {formatINR(loan.totalRepaymentAmount || 100000)}
                  </Text>
                </View>

                <View style={styles.rowDivider} />

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Interest Rate</Text>
                  <Text style={styles.breakdownValue}>
                    {loan.interestRate || 12}%
                  </Text>
                </View>

                <View style={styles.rowDivider} />

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Processing Fee</Text>
                  <Text style={styles.breakdownValue}>
                    {formatINR(loan.processingFee || 2000)}
                  </Text>
                </View>
              </Card>
            ) : (
              /* Repayment Progress & Summary Card */
              <View style={styles.summaryContainer}>
                {/* Progress Card */}
                <Card style={styles.progressCard} variant="flat" padding={16}>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.progressHeaderTitle}>Repayment Progress</Text>
                    <Text style={styles.progressPercentText}>{percentPaid}% Paid</Text>
                  </View>

                  {/* Progress Bar Track */}
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${percentPaid}%` }]} />
                  </View>

                  <View style={styles.progressSubRow}>
                    <Text style={styles.progressSubText}>
                      Paid: <Text style={styles.paidValue}>{formatINR(amountPaid)}</Text>
                    </Text>
                    <Text style={styles.progressSubText}>
                      Remaining: <Text style={styles.remainingValue}>{formatINR(remainingAmount)}</Text>
                    </Text>
                  </View>
                </Card>

                {/* Repayment Stats Breakdown Card */}
                <Card style={styles.breakdownCard} variant="flat" padding={16}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Total Repayment</Text>
                    <Text style={styles.breakdownValue}>{formatINR(totalRepayment)}</Text>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Total Amount Paid</Text>
                    <Text style={[styles.breakdownValue, styles.greenText]}>
                      {formatINR(amountPaid)}
                    </Text>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Remaining Balance</Text>
                    <Text style={[styles.breakdownValue, styles.amberText]}>
                      {formatINR(remainingAmount)}
                    </Text>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>EMIs Completed</Text>
                    <Text style={styles.breakdownValue}>10 of 12 (2 Pending)</Text>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Next Payment Date</Text>
                    <Text style={styles.breakdownValue}>{loan.nextPaymentDate || '15 Apr 2025'}</Text>
                  </View>
                </Card>

                {/* Quick Action Navigation Links */}
                <View style={styles.summaryActionsRow}>
                  <TouchableOpacity
                    style={styles.summaryActionBtn}
                    onPress={() => navigation.navigate(ROUTES.PAYMENT_HISTORY)}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="credit-card" size={15} color="#0D523B" />
                    <Text style={styles.summaryActionBtnText}>View Payment History</Text>
                    <AppIcon name="chevron-right" size={14} color="#0D523B" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.summaryActionBtn}
                    onPress={() => navigation.navigate(ROUTES.PAYMENT_SCHEDULE)}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="calendar" size={15} color="#0D523B" />
                    <Text style={styles.summaryActionBtnText}>View EMI Schedule</Text>
                    <AppIcon name="chevron-right" size={14} color="#0D523B" />
                  </TouchableOpacity>
                </View>
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
    backgroundColor: '#F4F9F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
