import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { CustomButton } from '../../component/Common/CustomButton';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { makePayment, fetchDashboardThunk } from '../../store/customerSlice';
import { showToast } from '../../store/toastSlice';
import { ROUTES } from '../../constants/routes';

/**
 * Screen 8: Pending Amount Screen
 * Red alert hero card, 3 separate breakdown cards for EMI, Late Fee & Other Charges,
 * and coral/red gradient "Pay Now" button with interactive payment sheet modal. Zero shadows.
 */
export const PendingAmountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const pending = useAppSelector(state => state.customer.pendingBreakdown);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchDashboardThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const handlePayNow = () => {
    setPaymentModalVisible(true);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentModalVisible(false);
      dispatch(makePayment({ amount: pending.totalPendingAmount || 12000, paymentMode: selectedMethod }));
      dispatch(
        showToast({
          type: 'success',
          title: 'Payment Successful',
          message: `Successfully paid ${formatINR(pending.totalPendingAmount || 12000)} via ${selectedMethod}`,
        })
      );
      navigation.navigate(ROUTES.PAYMENT_HISTORY);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Pending Amount" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#EF4444" />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={100} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={100} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={100} borderRadius={16} />
          </View>
        ) : (
          <>
            {/* Total Pending Hero Card */}
            <Card style={styles.alertCard} variant="flat" padding={18}>
              <View style={styles.alertTopRow}>
                <View style={styles.alertIconCircle}>
                  <Text style={styles.alertExclamation}>!</Text>
                </View>
                <View style={styles.alertTextGroup}>
                  <Text style={styles.alertLabel}>
                    Total Pending Amount
                  </Text>
                  <Text style={styles.totalAmount}>
                    ₹ 12,000
                  </Text>
                </View>
              </View>
            </Card>

            {/* 3 Breakdown Cards */}
            <View style={styles.breakdownList}>
              {/* Card 1: EMI Amount */}
              <Card style={styles.itemCard} variant="flat" padding={14}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemTitle}>EMI Amount</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                </View>
                <Text style={styles.itemAmount}>₹ 9,000</Text>
                <Text style={styles.itemDueDate}>Due Date: 15 Apr 2025</Text>
              </Card>

              {/* Card 2: Late Fee */}
              <Card style={styles.itemCard} variant="flat" padding={14}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemTitle}>Late Fee</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                </View>
                <Text style={styles.itemAmount}>₹ 1,000</Text>
              </Card>

              {/* Card 3: Other Charges */}
              <Card style={styles.itemCard} variant="flat" padding={14}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemTitle}>Other Charges</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                </View>
                <Text style={styles.itemAmount}>₹ 2,000</Text>
                <View style={styles.itemBottomActions}>
                  <TouchableOpacity
                    style={styles.viewDetailsTextBtn}
                    onPress={() => navigation.navigate(ROUTES.OVERDUE_DETAILS)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <AppIcon name="chevron-right" size={14} color="#0284C7" />
                  </TouchableOpacity>
                </View>
              </Card>
            </View>

            {/* Informational Gray Notice */}
            <Card style={styles.noteCard} variant="flat" padding={12}>
              <View style={styles.noteRow}>
                <AppIcon name="info" size={16} color="#475569" />
                <Text style={styles.noteText}>
                  Pay your pending dues quickly to restore your credit limit and avoid account suspension.
                </Text>
              </View>
            </Card>
          </>
        )}
        
        {/* Pay Now Button (Coral / Red Gradient) */}
        <CustomButton
          title="Pay Now"
          onPress={handlePayNow}
          variant="alert"
          size="large"
          style={styles.payNowBtn}
          gradientColors={['#FF5252', '#E53935']}
        />
      </ScrollView>

      {/* Payment Method Sheet Modal */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Complete Payment
              </Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <AppIcon name="alert-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.payableBanner}>
              <Text style={styles.payableLabel}>Payable Amount</Text>
              <Text style={styles.payableValue}>
                {formatINR(pending.totalPendingAmount || 12000)}
              </Text>
            </View>

            <Text style={styles.methodPrompt}>
              Select Payment Method
            </Text>

            {(['UPI', 'Card', 'NetBanking'] as const).map(method => {
              const isSelected = selectedMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodOption,
                    {
                      borderColor: isSelected ? '#0D523B' : '#E2E8F0',
                      backgroundColor: isSelected ? '#EAF5EE' : '#FFFFFF',
                    },
                  ]}
                  onPress={() => setSelectedMethod(method)}
                >
                  <View style={styles.methodLeft}>
                    <AppIcon
                      name={method === 'UPI' ? 'trending-up' : method === 'Card' ? 'credit-card' : 'wallet'}
                      size={18}
                      color={isSelected ? '#0D523B' : '#64748B'}
                    />
                    <Text style={styles.methodName}>
                      {method === 'UPI' ? 'UPI (GPay / PhonePe / Paytm)' : method === 'Card' ? 'Debit / Credit Card' : 'Net Banking'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? '#0D523B' : '#CBD5E1',
                        backgroundColor: isSelected ? '#0D523B' : 'transparent',
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}

            <CustomButton
              title={`Pay ${formatINR(pending.totalPendingAmount || 12000)}`}
              onPress={handleConfirmPayment}
              variant="alert"
              isLoading={isProcessing}
              style={{ marginTop: 16 }}
              gradientColors={['#FF5252', '#E53935']}
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
    backgroundColor: '#F4F9F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  alertCard: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    marginBottom: 16,
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertExclamation: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  alertTextGroup: {
    flex: 1,
  },
  alertLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EF4444',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  breakdownList: {
    gap: 10,
    marginBottom: 20,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  itemAmount: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  itemDueDate: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
  payNowBtn: {
    borderRadius: 24,
    height: 50,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  payableBanner: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  payableLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  payableValue: {
    color: '#EF4444',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  methodPrompt: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  methodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 8,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodName: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  itemBottomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewDetailsTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '600',
  },
  noteCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 24,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
