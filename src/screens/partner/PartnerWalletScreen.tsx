import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { CustomInput } from '../../component/Common/CustomInput';
import { CustomButton } from '../../component/Common/CustomButton';
import { Badge } from '../../component/Common/Badge';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { requestPartnerWithdrawal } from '../../store/partnerSlice';
import { showToast } from '../../store/toastSlice';
import { WithdrawalRequest } from '../../types/models';
import { ROUTES } from '../../constants/routes';

export const PartnerWalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { colors, typography, radius } = useAppTheme();
  const partner = useAppSelector(state => state.partner);

  const [modalVisible, setModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const [amount, setAmount] = useState('10000');
  const [bankAccount, setBankAccount] = useState('ICICI Bank •••• 8812');
  const [ifsc, setIfsc] = useState('ICIC0002345');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdrawRequest = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      dispatch(showToast({ type: 'error', title: 'Invalid Amount', message: 'Enter a valid amount.' }));
      return;
    }
    if (num > partner.details.walletBalance) {
      dispatch(showToast({ type: 'error', title: 'Insufficient Balance', message: 'Requested amount exceeds partner wallet balance.' }));
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      dispatch(requestPartnerWithdrawal({ amount: num, bankAccount, ifsc }));
      setIsSubmitting(false);
      setModalVisible(false);
      dispatch(
        showToast({
          type: 'success',
          title: 'Withdrawal Submitted',
          message: `Partner withdrawal request for ${formatINR(num)} submitted successfully.`,
        })
      );
    }, 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Partner Wallet" showBack={false} showNotification={true} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={180} borderRadius={16} style={{ marginBottom: 30 }} />
            <Skeleton width={180} height={24} style={{ marginBottom: 16 }} />
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height={80} borderRadius={12} style={{ marginBottom: 12 }} />
            ))}
          </View>
        ) : (
          <>
            {/* Wallet Balance Card */}
            <Card style={[styles.walletCard, { backgroundColor: colors.primaryBackground, borderColor: colors.borderGreen }]} variant="flat">
              <Text style={[typography.subtitle, { color: colors.primary, fontWeight: '700' }]}>
                Available Partner Wallet Balance
              </Text>
              <Text style={[typography.statValue, { color: colors.primary, marginTop: 4, fontWeight: '800' }]}>
                {formatINR(partner.details.walletBalance)}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                Formula: Partner Earnings - Completed Withdrawals
              </Text>

              <CustomButton
                title="Request Earnings Withdrawal"
                onPress={() => navigation.navigate(ROUTES.PARTNER_WITHDRAW as never)}
                variant="primary"
                style={{ marginTop: 16 }}
                gradientColors={colors.buttonGradient}
              />
            </Card>

            {/* Withdrawal History */}
            <Text style={[typography.h3, styles.sectionTitle, { color: colors.textPrimary }]}>
              Completed & Pending Withdrawals
            </Text>

            <View style={styles.list}>
              {partner.withdrawals.map((w: WithdrawalRequest) => (
                <Card key={w.id} style={[styles.card, { borderColor: colors.border }]} variant="flat" padding={14}>
                  <View style={styles.row}>
                    <View>
                      <Text style={[typography.h4, { color: colors.textPrimary }]}>
                        {formatINR(w.amount)}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                        {w.requestedDate} • {w.bankAccount}
                      </Text>
                    </View>
                    <Badge status={w.status} size="small" />
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Withdrawal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalSheet, { borderRadius: radius.xl, backgroundColor: colors.surface }]}>
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 12 }]}>
              Withdraw Earnings
            </Text>

            <CustomInput
              label="Withdrawal Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              leftIcon="wallet"
            />

            <CustomInput
              label="Bank Account"
              value={bankAccount}
              onChangeText={setBankAccount}
              leftIcon="credit-card"
            />

            <CustomInput
              label="IFSC Code"
              value={ifsc}
              onChangeText={setIfsc}
            />

            <CustomButton
              title={`Submit Request for ${formatINR(parseFloat(amount) || 0)}`}
              onPress={handleWithdrawRequest}
              variant="primary"
              isLoading={isSubmitting}
              style={{ marginTop: 12 }}
              gradientColors={colors.buttonGradient}
            />

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={[typography.button, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
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
  walletCard: {
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
});
