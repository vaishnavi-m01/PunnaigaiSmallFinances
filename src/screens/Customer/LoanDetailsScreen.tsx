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
          colors={isGold ? ['#8B5CF6', '#6D28D9'] : ['#10B981', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroLeft}>
              <View style={[styles.heroIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <AppIcon name={isGold ? 'lock' : 'user'} size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.heroTitle}>{detail.loan_package.name}</Text>
                <Text style={styles.heroSubtitle}>Loan No : {detail.loan_package.name.charAt(0)}L{loanId}</Text>
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

        <Text style={styles.sectionTitle}>Payment Schedule</Text>
        <View style={styles.scheduleCard}>
          {detail.repayment_schedules.map((item, index) => {
            const isPaid = ['paid', 'completed'].includes(item.status?.toLowerCase());
            const isLast = index === detail.repayment_schedules.length - 1;
            return (
              <View key={item.id} style={[styles.historyRow, !isLast && styles.rowBorder]}>
                <View style={styles.historyLeft}>
                  <AppIcon name={isPaid ? 'check-circle' : 'clock'} size={20} color={isPaid ? '#10B981' : '#F59E0B'} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.historyDate}>{formatDate(item.due_date)}</Text>
                    <Text style={styles.historySubtitle}>EMI Payment</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.historyAmount}>{formatINR(item.amount)}</Text>
                  <Text style={[styles.historyStatus, { color: isPaid ? '#10B981' : '#F59E0B' }]}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            );
          })}
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
    padding: 20,
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
    marginBottom: 20,
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
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500', marginTop: 2 },
  heroBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroBadgeText: { color: '#047857', fontSize: 11, fontWeight: '800' },
  heroAmount: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', marginTop: 4 },
  heroAmountLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  detailLabel: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  detailValue: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginLeft: 4,
  },
  
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  historySubtitle: { color: '#64748B', fontSize: 11, fontWeight: '500', marginTop: 2 },
  historyAmount: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
  historyStatus: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
