import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { CustomInput } from '../../component/Common/CustomInput';
import { CustomButton } from '../../component/Common/CustomButton';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { requestWithdrawal } from '../../store/investorSlice';
import { showToast } from '../../store/toastSlice';

const QUICK_AMOUNTS = [2000, 5000, 10000, 25000];

export const InvestorWithdrawScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { colors, typography, radius } = useAppTheme();
  const investor = useAppSelector(state => state.investor);

  const availableBalance = investor.details.walletBalance;

  const [amount, setAmount] = useState('10000');
  const [payoutMethod, setPayoutMethod] = useState<'BANK' | 'UPI'>('BANK');
  const [bankAccount, setBankAccount] = useState('HDFC Bank •••• 4390');
  const [accountHolder, setAccountHolder] = useState('Karthik Raja');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [upiId, setUpiId] = useState('karthik.investor@okhdfcbank');
  const [remarks, setRemarks] = useState('Monthly Return Payout');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const remainingBalance = Math.max(0, availableBalance - parsedAmount);

  const handleQuickSelect = (val: number) => {
    const finalVal = Math.min(val, availableBalance);
    setAmount(finalVal.toString());
  };

  const handleMaxSelect = () => {
    setAmount(availableBalance.toString());
  };

  const handleSubmit = () => {
    if (!parsedAmount || parsedAmount <= 0) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Invalid Amount',
          message: 'Please enter a valid withdrawal amount.',
        })
      );
      return;
    }

    if (parsedAmount < 500) {
      dispatch(
        showToast({
          type: 'warning',
          title: 'Minimum Withdrawal',
          message: 'Minimum withdrawal amount is ₹500.',
        })
      );
      return;
    }

    if (parsedAmount > availableBalance) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Insufficient Balance',
          message: `Amount exceeds your available wallet balance of ${formatINR(availableBalance)}.`,
        })
      );
      return;
    }

    if (payoutMethod === 'UPI' && !upiId.includes('@')) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Invalid UPI ID',
          message: 'Please provide a valid UPI Virtual Payment Address (e.g., name@bank).',
        })
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      dispatch(
        requestWithdrawal({
          amount: parsedAmount,
          bankAccount: payoutMethod === 'BANK' ? `${bankAccount} (${ifsc})` : `UPI: ${upiId}`,
          ifsc: payoutMethod === 'BANK' ? ifsc : 'UPI',
        })
      );
      setIsSubmitting(false);
      setSuccessModal(true);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Withdraw Funds" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={200} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={400} borderRadius={16} style={{ marginBottom: 16 }} />
          </View>
        ) : (
          <>
            {/* Balance Card */}
            <Card style={[styles.balanceCard, { backgroundColor: colors.primaryBackground, borderColor: colors.borderGreen }]} variant="flat">
          <View style={styles.balanceTop}>
            <View>
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                CURRENT INVESTOR WALLET BALANCE
              </Text>
              <Text style={[typography.statValue, { color: colors.primary, marginTop: 4, fontWeight: '800' }]}>
                {formatINR(availableBalance)}
              </Text>
            </View>
            <View style={[styles.walletIconCircle, { backgroundColor: colors.primarySoft }]}>
              <AppIcon name="wallet" size={24} color={colors.primary} />
            </View>
          </View>

          <View style={[styles.balanceDivider, { backgroundColor: colors.borderGreen }]} />

          <View style={styles.balanceFooter}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Est. Post-Withdrawal Balance:
            </Text>
            <Text style={[typography.bodyBold, { color: colors.primary }]}>
              {formatINR(remainingBalance)}
            </Text>
          </View>
        </Card>

        {/* Amount Section */}
        <Card style={[styles.sectionCard, { borderColor: colors.border }]} variant="elevated">
          <View style={styles.sectionHeaderRow}>
            <Text style={[typography.h4, { color: colors.textPrimary }]}>Enter Withdrawal Amount</Text>
            <TouchableOpacity onPress={handleMaxSelect}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>WITHDRAW ALL</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputBox, { borderColor: parsedAmount > availableBalance ? colors.error : colors.border }]}>
            <Text style={[styles.currencyPrefix, { color: colors.textPrimary }]}>₹</Text>
            <TextInput
              style={[styles.numericInput, { color: colors.textPrimary }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Quick Select Chips */}
          <View style={styles.chipsContainer}>
            {QUICK_AMOUNTS.map(val => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.chip,
                  {
                    backgroundColor: parsedAmount === val ? colors.primarySoft : colors.surfaceSubtle,
                    borderColor: parsedAmount === val ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleQuickSelect(val)}>
                <Text
                  style={[
                    typography.captionBold,
                    { color: parsedAmount === val ? colors.primary : colors.textSecondary },
                  ]}>
                  +{formatINR(val)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Payout Method */}
        <Card style={[styles.sectionCard, { borderColor: colors.border }]} variant="elevated">
          <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: 12 }]}>
            Select Payout Destination
          </Text>

          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodTab,
                { borderColor: payoutMethod === 'BANK' ? colors.primary : colors.border, backgroundColor: payoutMethod === 'BANK' ? colors.primarySoft : colors.surfaceSubtle },
              ]}
              onPress={() => setPayoutMethod('BANK')}>
              <AppIcon
                name="credit-card"
                size={20}
                color={payoutMethod === 'BANK' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: payoutMethod === 'BANK' ? colors.primary : colors.textSecondary, marginTop: 4 },
                ]}>
                Bank Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodTab,
                { borderColor: payoutMethod === 'UPI' ? colors.primary : colors.border, backgroundColor: payoutMethod === 'UPI' ? colors.primarySoft : colors.surfaceSubtle },
              ]}
              onPress={() => setPayoutMethod('UPI')}>
              <AppIcon
                name="send"
                size={20}
                color={payoutMethod === 'UPI' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: payoutMethod === 'UPI' ? colors.primary : colors.textSecondary, marginTop: 4 },
                ]}>
                UPI / VPA
              </Text>
            </TouchableOpacity>
          </View>

          {payoutMethod === 'BANK' ? (
            <View style={{ marginTop: 12 }}>
              <CustomInput
                label="Account Holder Name"
                value={accountHolder}
                onChangeText={setAccountHolder}
              />
              <CustomInput
                label="Bank & Account Number"
                value={bankAccount}
                onChangeText={setBankAccount}
                leftIcon="credit-card"
              />
              <CustomInput
                label="IFSC Code"
                value={ifsc}
                onChangeText={setIfsc}
                autoCapitalize="characters"
              />
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              <CustomInput
                label="UPI Virtual Payment Address (VPA)"
                value={upiId}
                onChangeText={setUpiId}
                placeholder="username@okhdfcbank"
                leftIcon="send"
                autoCapitalize="none"
              />
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: -8, marginBottom: 8 }]}>
                Instant payout to Google Pay, PhonePe, Paytm or BHIM UPI ID.
              </Text>
            </View>
          )}

          <CustomInput
            label="Remarks / Note (Optional)"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="e.g. Dividend withdrawal"
          />
        </Card>

        {/* Withdrawal Info & SLA */}
        <View style={[styles.infoBox, { backgroundColor: colors.primaryBackground, borderColor: colors.borderGreen }]}>
          <AppIcon name="info" size={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              Fast & Direct Disbursement
            </Text>
            <Text style={[typography.caption, { color: colors.primaryLight, marginTop: 2 }]}>
              Withdrawal requests are reviewed by Finance Admin and directly credited to your verified bank/UPI account within 24-48 business hours.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <CustomButton
          title={isSubmitting ? 'Submitting Request...' : `Withdraw ${formatINR(parsedAmount)}`}
          onPress={handleSubmit}
          variant="primary"
          isLoading={isSubmitting}
          style={{ marginTop: 20 }}
          gradientColors={colors.buttonGradient}
        />
        </>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
            <View style={[styles.successIconCircle, { backgroundColor: colors.primarySoft }]}>
              <AppIcon name="check-circle" size={44} color={colors.primary} />
            </View>

            <Text style={[typography.h3, { color: colors.textPrimary, marginTop: 16, textAlign: 'center' }]}>
              Withdrawal Request Submitted!
            </Text>

            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              Your request for <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{formatINR(parsedAmount)}</Text> has been queued for admin verification and payout disbursement.
            </Text>

            <View style={[styles.summaryBox, { backgroundColor: colors.surfaceSubtle }]}>
              <View style={styles.summaryRow}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Payout Destination</Text>
                <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
                  {payoutMethod === 'BANK' ? bankAccount : upiId}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Estimated Time</Text>
                <Text style={[typography.captionBold, { color: colors.primary }]}>24 - 48 Hours</Text>
              </View>
            </View>

            <CustomButton
              title="Done & View Wallet"
              onPress={() => {
                setSuccessModal(false);
                navigation.goBack();
              }}
              variant="primary"
              style={{ marginTop: 20, width: '100%' }}
              gradientColors={colors.buttonGradient}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceDivider: {
    height: 1,
    marginVertical: 12,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 6,
  },
  numericInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  methodTab: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBox: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
