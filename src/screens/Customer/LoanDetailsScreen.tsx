import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../component/AppIcon';
import { Header } from '../../component/Header';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { submitLoanRequestThunk } from '../../store/customerSlice';
import { showToast } from '../../store/toastSlice';
import * as customerApi from '../../services/api/customerApi';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export const LoanDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const loanId = Number(route.params?.loanId || 1);
  const isSubmitting = useAppSelector(state => state.customer.isSubmittingLoan);
  const [detail, setDetail] = useState<customerApi.LoanDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openApplyConfirmation = () => {
    setShowConfirm(true);
  };

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Loan Details"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0D523B" />
          <Text style={styles.stateText}>Loading loan details...</Text>
        </View>
      ) : hasError || !detail ? (
        <View style={styles.centerState}>
          <AppIcon name="alert-circle" size={28} color="#B45309" />
          <Text style={styles.errorTitle}>Unable to load loan details</Text>
          <Text style={styles.stateText}>Please try again later.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 104 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Loan summary</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{detail.status}</Text>
              </View>
            </View>
            <View style={styles.overviewAmounts}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Total loan amount</Text>
                <Text style={styles.overviewValue}>
                  {formatINR(detail.requested_amount)}
                </Text>
                <Text style={styles.overviewHint}>Requested</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Amount you receive</Text>
                <Text style={styles.overviewValue}>
                  {formatINR(detail.approved_amount)}
                </Text>
                <Text style={styles.overviewHint}>After deduction</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Financial summary</Text>
          <View style={styles.summaryCard}>
            <SummaryItem
              label="Total repayment"
              value={formatINR(detail.repayment_obligation)}
            />
            <SummaryItem
              label="Upfront deduction"
              value={formatINR(detail.deduction_amount)}
            />
            <SummaryItem
              label="Final due date"
              value={formatDate(detail.due_date)}
            />
          </View>

          <Text style={styles.sectionTitle}>Loan package</Text>
          <View style={styles.packageCard}>
            <Text style={styles.packageName}>{detail.loan_package.name}</Text>
            <Text style={styles.packageText}>
              {detail.loan_package.repayment_period}{' '}
              {detail.loan_package.repayment_frequency} ·{' '}
              {detail.loan_package.installment_count} installments
            </Text>
            <Text style={styles.packageText}>
              Deduction: {detail.loan_package.deduction_percentage}%
            </Text>
          </View>

          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Repayment schedule</Text>
            <Text style={styles.scheduleCount}>
              {detail.repayment_schedules.length} dues
            </Text>
          </View>
          <View style={styles.scheduleCard}>
            {detail.repayment_schedules.map((item, index) => (
              <View key={item.id} style={styles.scheduleRow}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleDate}>
                    {formatDate(item.due_date)}
                  </Text>
                  <Text style={styles.scheduleStatus}>{item.status}</Text>
                </View>
                <Text style={styles.scheduleAmount}>
                  {formatINR(item.amount)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.applySpace} />
        </ScrollView>
      )}

      {!loading && detail && !hasError && (
        <View
          style={[
            styles.applyFooter,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.applyButton}
            onPress={openApplyConfirmation}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Apply for this loan"
          >
            <AppIcon name="file-text" size={18} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply for this loan</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <AppIcon name="file-text" size={28} color="#0D523B" />
            </View>
            <Text style={styles.confirmTitle}>Confirm loan request</Text>
            <Text style={styles.confirmMessage}>
              Apply for {detail?.loan_package.name} with a requested amount of{' '}
              {formatINR(detail?.requested_amount)}?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={async () => {
                  if (!detail) return;
                  const result = await dispatch(
                    submitLoanRequestThunk({
                      loan_package_id: detail.loan_package_id,
                      requested_amount: Number(detail.requested_amount),
                    }),
                  );
                  if (submitLoanRequestThunk.fulfilled.match(result)) {
                    setShowConfirm(false);
                    dispatch(
                      showToast({
                        type: 'success',
                        title: 'Request submitted',
                        message:
                          'Your loan request was submitted successfully.',
                      }),
                    );
                  } else {
                    dispatch(
                      showToast({
                        type: 'error',
                        title: 'Submission failed',
                        message:
                          (result.payload as string) || 'Please try again.',
                      }),
                    );
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    height: 74,
    paddingHorizontal: 18,
    paddingTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
  headerSpacer: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  applySpace: { height: 72 },
  overviewCard: {
    backgroundColor: '#0D523B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  overviewAmounts: { flexDirection: 'row', alignItems: 'center' },
  overviewItem: { flex: 1, minWidth: 0 },
  overviewLabel: { color: '#D1FAE5', fontSize: 11, fontWeight: '700' },
  overviewValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 5,
  },
  overviewHint: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  overviewDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  statusPill: {
    backgroundColor: 'rgba(167,243,208,0.18)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusPillText: {
    color: '#D1FAE5',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 14,
  },
  approvedCard: {
    backgroundColor: '#0D523B',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  cardLabel: { color: '#A7F3D0', fontSize: 12, fontWeight: '800' },
  approvedValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  cardHint: { color: '#D1FAE5', fontSize: 11, fontWeight: '600' },
  status: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardHintDark: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
  },
  receiveCard: {
    backgroundColor: '#EAF5EE',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 18,
    marginBottom: 24,
  },
  receiveCardLabel: { color: '#0D523B', fontSize: 12, fontWeight: '800' },
  receiveCardValue: {
    color: '#0D523B',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  summaryCard: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
  packageCard: {
    backgroundColor: '#EAF5EE',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  packageName: { color: '#0D523B', fontSize: 15, fontWeight: '900' },
  packageText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleCount: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  scheduleRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  numberText: { color: '#0D523B', fontSize: 11, fontWeight: '900' },
  scheduleInfo: { flex: 1 },
  scheduleDate: { color: '#0F172A', fontSize: 12, fontWeight: '800' },
  scheduleStatus: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    textTransform: 'capitalize',
  },
  scheduleAmount: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  applyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    zIndex: 20,
    elevation: 12,
  },
  applyButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0D523B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  applyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  confirmMessage: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  confirmActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { color: '#475569', fontSize: 14, fontWeight: '800' },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0D523B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
