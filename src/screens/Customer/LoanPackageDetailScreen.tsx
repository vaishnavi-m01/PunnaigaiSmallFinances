import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { submitLoanRequestThunk } from '../../store/customerSlice';
import { LoanPackage } from '../../types/models';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { showToast } from '../../store/toastSlice';
import { ROUTES } from '../../constants/routes';
import apiClient from '../../services/apiClient';

export const LoanPackageDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const { colors, typography } = useAppTheme();

  const pkg: LoanPackage = route.params?.pkg;
  const isSubmittingLoan = useAppSelector(state => state.customer.isSubmittingLoan);

  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/loan-packages/${pkg.id}`);
        const body = response.data as any;
        setDetail(body.data ?? body);
      } catch {
        // fallback to passed-in pkg data
        setDetail(pkg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [pkg]);

  const data = detail ?? pkg;

  const deductionAmt = (data?.minAmount ?? 0) * ((data?.deductionPercentage ?? 0) / 100);
  const netAmount = (data?.minAmount ?? 0) - deductionAmt;

  const handleConfirmSubmit = async () => {
    const result = await dispatch(
      submitLoanRequestThunk({
        loan_package_id: pkg.id,
        requested_amount: data?.minAmount ?? 0,
      })
    );
    if (submitLoanRequestThunk.fulfilled.match(result)) {
      setShowConfirm(false);
      setTimeout(() => setShowSuccess(true), 300);
    } else {
      setShowConfirm(false);
      const errMsg = result.payload as string;
      dispatch(showToast({ type: 'error', title: 'Submission Failed', message: errMsg }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.bodyMedium, styles.loadingText]}> 
            Loading details…
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Package Hero Card */}
          <View style={styles.heroCard}>
            <View style={[styles.heroIcon, styles.primarySoftBackground]}>
              <AppIcon name="briefcase" size={30} color={colors.primary} />
            </View>
            <Text style={styles.heroPackageName}>{data?.name}</Text>
            <View style={styles.heroBadgeRow}>
              <View style={[styles.heroBadge, styles.primarySoftBackground]}>
                <Text style={[styles.heroBadgeText, styles.primaryText]}>
                  {data?.repaymentPeriod} {data?.repaymentFrequency}
                </Text>
              </View>
              <View style={styles.installmentBadge}>
                <Text style={styles.installmentBadgeText}>
                  {data?.dueCalculationType === 'lump_sum' ? 'Lump Sum' : `${data?.installmentCount} Installments`}
                </Text>
              </View>
            </View>
          </View>

          {/* Amount Range */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>AMOUNT DETAILS</Text>
            <View style={styles.amountRow}>
              <View style={styles.amountCol}>
                <Text style={styles.amountCaption}>Minimum Amount</Text>
                <Text style={[styles.amountValue, styles.primaryText]}>
                  {formatINR(data?.minAmount ?? 0)}
                </Text>
              </View>
              <View style={styles.amountDivider} />
              <View style={styles.amountCol}>
                <Text style={styles.amountCaption}>Maximum Amount</Text>
                <Text style={[styles.amountValue, styles.primaryText]}>
                  {formatINR(data?.maxAmount ?? 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Loan Breakdown */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>LOAN BREAKDOWN (Based on Min Amount)</Text>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={styles.loanAmountIcon}>
                  <AppIcon name="trending-up" size={14} color="#3B82F6" />
                </View>
                <Text style={styles.breakdownLabel}>Loan Amount</Text>
              </View>
              <Text style={styles.breakdownValue}>{formatINR(data?.minAmount ?? 0)}</Text>
            </View>

            <View style={styles.deductionRow}>
              <View style={styles.breakdownLeft}>
                <View style={styles.deductionIcon}>
                  <AppIcon name="percent" size={14} color="#C2410C" />
                </View>
                <Text style={styles.breakdownLabel}>Deduction ({data?.deductionPercentage}%)</Text>
              </View>
              <Text style={[styles.breakdownValue, styles.deductionValue]}>– {formatINR(deductionAmt)}</Text>
            </View>

            <View style={styles.receiveRow}>
              <View style={styles.breakdownLeft}>
                <View style={styles.receiveIcon}>
                  <AppIcon name="check-circle" size={14} color="#16A34A" />
                </View>
                <Text style={[styles.breakdownLabel, styles.receiveLabel]}>You Receive</Text>
              </View>
              <Text style={styles.receiveValue}>
                {formatINR(netAmount)}
              </Text>
            </View>
          </View>

          {/* Repayment Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>REPAYMENT DETAILS</Text>

            {[
              { label: 'Total Repayment', value: formatINR(data?.minAmount ?? 0), icon: 'credit-card' },
              { label: 'Repayment Period', value: `${data?.repaymentPeriod} ${data?.repaymentFrequency}`, icon: 'calendar' },
              {
                label: 'Payment Type',
                value: data?.dueCalculationType === 'lump_sum' ? 'Lump Sum' : 'Installments',
                icon: 'layers',
              },
              ...(data?.dueCalculationType !== 'lump_sum'
                ? [{ label: 'Installment Count', value: `${data?.installmentCount} installments`, icon: 'list' }]
                : []),
              ...(data?.penaltyEnabled
                ? [{ label: 'Penalty', value: `${data?.penaltyAmountOrPercentage}% after ${data?.missedDuesBeforePenalty} missed`, icon: 'alert-triangle' }]
                : [{ label: 'Penalty', value: 'No penalty', icon: 'shield' }]),
            ].map((item, i) => (
              <View key={i} style={styles.repaymentRow}>
                <View style={[styles.repaymentIcon, styles.primarySoftBackground]}>
                  <AppIcon name={item.icon as any} size={14} color={colors.primary} />
                </View>
                <Text style={styles.repaymentLabel}>{item.label}</Text>
                <Text style={styles.repaymentValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Info Note */}
          <View style={[styles.infoBox, styles.primaryBorder]}>
            <AppIcon name="info" size={16} color={colors.primary} />
            <Text style={[styles.infoText, styles.primaryText]}>
              The deduction amount is collected upfront. You will receive the net amount after deduction.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Sticky Apply Button */}
      {!isLoading && (
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={[styles.applyBtn, styles.primaryBackground]}
            onPress={() => setShowConfirm(true)}
          >
            <AppIcon name="file-text" size={18} color="#FFF" />
            <Text style={styles.applyBtnText}>Apply for this Package</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Confirm Modal ── */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={[styles.confirmIconBox, styles.primarySoftBackground]}>
              <AppIcon name="file-text" size={32} color={colors.primary} />
            </View>
            <Text style={styles.confirmTitle}>Confirm Application</Text>
            <Text style={styles.confirmSub}>
              You are about to apply for{' '}
              <Text style={styles.emphasisText}>{data?.name}</Text>.
            </Text>

            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Package</Text>
                <Text style={styles.confirmValue}>{data?.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Amount Range</Text>
                <Text style={styles.confirmValue}>
                  {formatINR(data?.minAmount ?? 0)} – {formatINR(data?.maxAmount ?? 0)}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Deduction</Text>
                <Text style={[styles.confirmValue, styles.deductionValue]}>
                  {data?.deductionPercentage}%
                </Text>
              </View>
              <View style={[styles.confirmRow, styles.lastConfirmRow]}>
                <Text style={styles.confirmLabel}>Duration</Text>
                <Text style={styles.confirmValue}>
                  {data?.repaymentPeriod} {data?.repaymentFrequency}
                </Text>
              </View>
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmSubmitBtn, styles.primaryBackground]}
                onPress={handleConfirmSubmit}
                disabled={isSubmittingLoan}
              >
                {isSubmittingLoan ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.confirmSubmitText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Success Modal ── */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.successIconBox}>
              <AppIcon name="check-circle" size={40} color="#16A34A" />
            </View>
            <Text style={styles.confirmTitle}>Request Submitted!</Text>
            <Text style={styles.confirmSub}>
              Your loan request for{' '}
              <Text style={styles.emphasisText}>{data?.name}</Text> has been submitted successfully. You'll be notified once reviewed.
            </Text>
            <TouchableOpacity
              style={[styles.applyBtn, styles.primaryBackground]}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate(ROUTES.CUSTOMER_TABS);
              }}
            >
              <Text style={styles.applyBtnText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 116,
  },
  headerSpacer: { width: 36 },
  loadingText: { color: '#64748B', marginTop: 12 },
  primaryBackground: { backgroundColor: '#0D523B' },
  primarySoftBackground: { backgroundColor: '#EAF5EE' },
  primaryText: { color: '#0D523B' },
  primaryBorder: { borderColor: '#A7F3D0' },
  installmentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FEF9C3',
  },
  installmentBadgeText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  loanAmountIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  deductionRow: { backgroundColor: '#FFF7ED' },
  deductionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FED7AA',
  },
  deductionValue: { color: '#C2410C' },
  receiveRow: { backgroundColor: '#F0FDF4', borderRadius: 10 },
  receiveIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BBF7D0',
  },
  receiveLabel: { fontWeight: '700' },
  receiveValue: { color: '#16A34A', fontSize: 16, fontWeight: '800' },
  emphasisText: { fontWeight: '700', color: '#0F172A' },
  lastConfirmRow: { borderBottomWidth: 0 },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#DCFCE7',
  },
  // Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroPackageName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Section Card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  // Amount Row
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
  },
  amountDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  amountCaption: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  // Breakdown
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  // Repayment
  repaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  repaymentIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repaymentLabel: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  repaymentValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  // Info box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  // Sticky Footer
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  applyBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  confirmIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  confirmSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmDetails: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  confirmLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmSubmitBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
