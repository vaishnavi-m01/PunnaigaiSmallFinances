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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { submitLoanRequestThunk } from '../../store/customerSlice';
import { LoanPackage } from '../../types/models';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { showToast } from '../../store/toastSlice';
import { ROUTES } from '../../constants/routes';
import * as customerApi from '../../services/api/customerApi';

export const LoanPackageDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const { colors, typography } = useAppTheme();

  const pkg: LoanPackage = route.params?.pkg;
  const isSubmittingLoan = useAppSelector(
    state => state.customer.isSubmittingLoan,
  );

  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [requestedAmountStr, setRequestedAmountStr] = useState<string>('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await customerApi.getLoanPackageDetail(pkg.id);
        setDetail({
          id: response.id,
          name: response.name,
          minAmount: parseFloat(response.min_amount),
          maxAmount: parseFloat(response.max_amount),
          deductionPercentage: parseFloat(response.deduction_percentage),
          repaymentPeriod: response.repayment_period,
          repaymentFrequency: response.repayment_frequency,
          dueCalculationType: response.due_calculation_type,
          installmentCount: response.installment_count,
          penaltyEnabled: response.penalty_enabled,
          missedDuesBeforePenalty: response.missed_dues_before_penalty,
          penaltyType: response.penalty_type,
          penaltyAmountOrPercentage: response.penalty_amount_or_percentage
            ? parseFloat(response.penalty_amount_or_percentage)
            : null,
          status: response.status,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        });
      } catch {
        setDetail(pkg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [pkg]);

  const data = detail ?? pkg;

  useEffect(() => {
    if (data?.minAmount && !requestedAmountStr) {
      setRequestedAmountStr(data.minAmount.toString());
    }
  }, [data?.minAmount]);

  const deductionAmt =
    (data?.minAmount ?? 0) * ((data?.deductionPercentage ?? 0) / 100);
  const netAmount = (data?.minAmount ?? 0) - deductionAmt;

  const handleConfirmSubmit = async () => {
    const reqAmount = parseFloat(requestedAmountStr);
    if (
      isNaN(reqAmount) ||
      reqAmount < (data?.minAmount ?? 0) ||
      reqAmount > (data?.maxAmount ?? 0)
    ) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Invalid Amount',
          message: 'Please enter a valid amount within the allowed range.',
        }),
      );
      return;
    }

    const result = await dispatch(
      submitLoanRequestThunk({
        loan_package_id: pkg.id,
        requested_amount: reqAmount,
      }),
    );
    if (submitLoanRequestThunk.fulfilled.match(result)) {
      setShowConfirm(false);
      setTimeout(() => setShowSuccess(true), 300);
    } else {
      setShowConfirm(false);
      const errMsg = result.payload as string;
      dispatch(
        showToast({
          type: 'error',
          title: 'Submission Failed',
          message: errMsg,
        }),
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Details</Text>
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 128 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Package Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <View style={[styles.heroIcon, styles.primarySoftBackground]}>
                <AppIcon name="briefcase" size={24} color={colors.primary} />
              </View>
              <View style={styles.heroTexts}>
                <Text style={styles.heroPackageName}>{data?.name}</Text>
                <View style={styles.heroBadgeRow}>
                  <View
                    style={[styles.heroBadge, styles.primarySoftBackground]}
                  >
                    <Text style={[styles.heroBadgeText, styles.primaryText]}>
                      {data?.repaymentPeriod} {data?.repaymentFrequency}
                    </Text>
                  </View>
                  <View style={styles.installmentBadge}>
                    <Text style={styles.installmentBadgeText}>
                      {data?.dueCalculationType === 'lump_sum'
                        ? 'Lump Sum'
                        : `${data?.installmentCount} Installments`}
                    </Text>
                  </View>
                </View>
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
            <Text style={styles.sectionLabel}>
              LOAN BREAKDOWN (Based on Min Amount)
            </Text>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.breakdownIcon, { backgroundColor: '#EFF6FF' }]}
                >
                  <AppIcon name="trending-up" size={14} color="#3B82F6" />
                </View>
                <Text style={styles.breakdownLabel}>Loan Amount</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {formatINR(data?.minAmount ?? 0)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.breakdownIcon, { backgroundColor: '#FFEDD5' }]}
                >
                  <AppIcon name="percent" size={14} color="#C2410C" />
                </View>
                <Text style={styles.breakdownLabel}>
                  Deduction ({data?.deductionPercentage}%)
                </Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#C2410C' }]}>
                – {formatINR(deductionAmt)}
              </Text>
            </View>

            <View
              style={[
                styles.breakdownRow,
                {
                  backgroundColor: '#F0FDF4',
                  marginTop: 4,
                  paddingVertical: 12,
                },
              ]}
            >
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.breakdownIcon, { backgroundColor: '#DCFCE7' }]}
                >
                  <AppIcon name="check-circle" size={14} color="#16A34A" />
                </View>
                <Text
                  style={[
                    styles.breakdownLabel,
                    { color: '#166534', fontWeight: '700' },
                  ]}
                >
                  You Receive
                </Text>
              </View>
              <Text
                style={[
                  styles.breakdownValue,
                  { color: '#16A34A', fontSize: 16 },
                ]}
              >
                {formatINR(netAmount)}
              </Text>
            </View>
          </View>

          {/* Repayment Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>REPAYMENT DETAILS</Text>

            {[
              {
                label: 'Total Repayment',
                value: formatINR(data?.minAmount ?? 0),
                icon: 'credit-card',
              },
              {
                label: 'Repayment Period',
                value: `${data?.repaymentPeriod} ${data?.repaymentFrequency}`,
                icon: 'calendar',
              },
              {
                label: 'Payment Type',
                value:
                  data?.dueCalculationType === 'lump_sum'
                    ? 'Lump Sum'
                    : 'Installments',
                icon: 'layers',
              },
              ...(data?.dueCalculationType !== 'lump_sum'
                ? [
                    {
                      label: 'Installment Count',
                      value: `${data?.installmentCount} installments`,
                      icon: 'list',
                    },
                  ]
                : []),
              ...(data?.penaltyEnabled
                ? [
                    {
                      label: 'Penalty',
                      value: `${data?.penaltyAmountOrPercentage}% after ${data?.missedDuesBeforePenalty} missed`,
                      icon: 'alert-triangle',
                    },
                  ]
                : [{ label: 'Penalty', value: 'No penalty', icon: 'shield' }]),
            ].map((item, i) => (
              <View key={i} style={styles.repaymentRow}>
                <View
                  style={[styles.repaymentIcon, styles.primarySoftBackground]}
                >
                  <AppIcon
                    name={item.icon as any}
                    size={14}
                    color={colors.primary}
                  />
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
              The deduction amount is collected upfront. You will receive the
              net amount after deduction.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Sticky Apply Button */}
      {!isLoading && (
        <View
          style={[
            styles.stickyFooter,
            { paddingBottom: Math.max(insets.bottom + 12, 24) },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyBtn, styles.primaryBackground]}
            onPress={() => setShowConfirm(true)}
            activeOpacity={0.85}
          >
            <AppIcon name="file-text" size={18} color="#FFF" />
            <Text style={styles.applyBtnText}>Apply for this Package</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Confirm Modal ── */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
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

              <View
                style={[
                  styles.confirmRow,
                  {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <Text style={[styles.confirmLabel, { marginBottom: 8 }]}>
                  Requested Amount ({formatINR(data?.minAmount ?? 0)} –{' '}
                  {formatINR(data?.maxAmount ?? 0)})
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={requestedAmountStr}
                    onChangeText={setRequestedAmountStr}
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />
                </View>
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
        </KeyboardAvoidingView>
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
              <Text style={styles.emphasisText}>{data?.name}</Text> has been
              submitted successfully. You'll be notified once reviewed.
            </Text>
            <TouchableOpacity
              style={[
                styles.applyBtn,
                styles.successActionBtn,
                styles.primaryBackground,
              ]}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate(ROUTES.CUSTOMER_TABS);
              }}
              activeOpacity={0.85}
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTexts: {
    flex: 1,
  },
  heroPackageName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
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
    paddingTop: 12,
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
  },
  applyBtnText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  successActionBtn: {
    width: '100%',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
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
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#475569',
    marginRight: 8,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    padding: 0,
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
