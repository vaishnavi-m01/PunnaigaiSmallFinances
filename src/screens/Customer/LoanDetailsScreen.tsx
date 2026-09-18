import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { AppIcon } from '../../component/AppIcon';
import { Header } from '../../component/Header';
import * as customerApi from '../../services/api/customerApi';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { ROUTES } from '../../constants/routes';

export const LoanDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const loanId = Number(route.params?.loanId || 1);
  
  const [detail, setDetail] = useState<customerApi.LoanDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    customerApi
      .getLoanDetail(loanId)
      .then(result => {
        if (mounted) setDetail(result);
      })
      .catch(() => {
        if (mounted) setHasError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loanId]);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (hasError || !detail) {
    return (
      <View style={styles.centerState}>
        <AppIcon name="alert-circle" size={28} color="#EF4444" />
        <Text style={styles.stateText}>Unable to load loan details</Text>
      </View>
    );
  }

  // Derive stats
  const totalLoanAmount = detail.repayment_schedules.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalPaid = detail.repayment_schedules.reduce((sum, s) => sum + Number(s.paid_amount || 0), 0);
  const remaining = totalLoanAmount - totalPaid;
  const nextEMI = detail.repayment_schedules.find(s => !['paid', 'completed'].includes(s.status.toLowerCase()));
  
  const isGold = detail.loan_package.name.toLowerCase().includes('gold');
  const gradientColors = isGold ? ['#8B5CF6', '#6D28D9'] : ['#10B981', '#047857'];
  const loanIcon = isGold ? 'lock' : 'user';
  const prefix = isGold ? 'GL' : 'PL';
  const loanNo = `${prefix}202500${loanId}`;
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Loan Details"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Hero Gradient Card */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroLeft}>
              <View style={[styles.heroIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <AppIcon name={loanIcon} size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.heroTitle}>{detail.loan_package.name}</Text>
                <Text style={styles.heroSubtitle}>Loan No : {loanNo}</Text>
              </View>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Active</Text>
            </View>
          </View>
          
          <Text style={styles.heroAmount}>{formatINR(totalLoanAmount)}</Text>
          <Text style={styles.heroAmountLabel}>Total Loan Amount</Text>
        </LinearGradient>

        {/* Details List Card */}
        <View style={styles.detailsCard}>
          <DetailRow icon="clock" label="Tenure" value={`${detail.loan_package.installment_count} Months`} />
          <DetailRow icon="percent" label="Interest Rate" value={`${detail.loan_package.deduction_percentage}% p.a.`} />
          <DetailRow icon="arrow-down-circle" label="Monthly EMI" value={formatINR(detail.repayment_schedules[0]?.amount || 0)} />
          <DetailRow icon="calendar" label="Start Date" value={formatDate(detail.repayment_schedules[0]?.due_date || new Date().toISOString())} />
          <DetailRow icon="calendar" label="End Date" value={formatDate(detail.repayment_schedules[detail.repayment_schedules.length - 1]?.due_date || new Date().toISOString())} isLast />
        </View>

        {/* View Payment History Button */}
        <TouchableOpacity
          style={styles.outlineButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.PAYMENT_HISTORY, { loanId: detail.finance_id || detail.loan_request_id })}
        >
          <AppIcon name="clock" size={18} color="#0D523B" />
          <Text style={styles.outlineButtonText}>View Payment History</Text>
        </TouchableOpacity>

        {/* Loan Summary */}
        <Text style={styles.sectionTitle}>Loan Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={[styles.summaryValue, { color: '#0F172A' }]}>{formatINR(totalPaid)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={[styles.summaryValue, { color: '#0F172A' }]}>{formatINR(remaining)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Next EMI Due</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {nextEMI ? formatDate(nextEMI.due_date) : 'Completed'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const DetailRow = ({ icon, label, value, isLast }: { icon: any, label: string, value: string, isLast?: boolean }) => (
  <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
    <View style={styles.detailRowLeft}>
      <View style={styles.detailIconCircle}>
        <AppIcon name={icon} size={14} color="#10B981" />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stateText: { marginTop: 12, color: '#64748B', fontSize: 14 },
  content: { padding: 16, paddingBottom: 100 },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  heroBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroBadgeText: { color: '#047857', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  heroAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  heroAmountLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  detailValue: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0D523B',
    marginBottom: 24,
    gap: 8,
  },
  outlineButtonText: {
    color: '#0D523B',
    fontSize: 15,
    fontWeight: '800',
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  summaryLabel: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  summaryValue: { fontSize: 15, fontWeight: '800' },
});
