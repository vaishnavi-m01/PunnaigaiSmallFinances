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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { CustomInput } from '../../component/Common/CustomInput';
import { CustomButton } from '../../component/Common/CustomButton';
import { Skeleton } from '../../component/Common/Skeleton';
import { recordCollectionThunk } from '../../features/agent/collectionThunks';
import { showToast } from '../../store/toastSlice';
import { formatINR } from '../../utils/currency';
import { AssignedCustomer } from '../../types/models';

export const AddCollectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const { colors, typography, radius } = useAppTheme();

  const customers = useAppSelector(state => state.agent.assignedCustomers);
  const defaultCustomerId = route.params?.customerId || customers[0]?.id;
  const initialCustomer =
    customers.find((c: AssignedCustomer) => c.id === defaultCustomerId) ||
    customers[0];

  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomer);
  const [amount, setAmount] = useState(
    String(
      route.params?.defaultAmount || initialCustomer?.pendingAmount || '9000',
    ),
  );
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Cheque'>(
    'UPI',
  );
  const [remarks, setRemarks] = useState('');
  const isSubmitting = useAppSelector(state => state.agent.isSubmittingCollection);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Invalid Amount',
          message: 'Please enter a valid collection amount.',
        }),
      );
      return;
    }

    try {
      await dispatch(
        recordCollectionThunk({
          customerName: selectedCustomer.name,
          customerId: selectedCustomer.id,
          loanId: selectedCustomer.loanId,
          amount: numAmount,
          paymentMethod: paymentMode,
          remarks,
        }),
      ).unwrap();
      dispatch(
        showToast({
          type: 'success',
          title: 'Collection Recorded',
          message: `Recorded collection of ${formatINR(numAmount)} for ${
            selectedCustomer.name
          }`,
        }),
      );
      navigation.goBack();
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Collection Failed',
          message: String(error || 'Unable to record collection. Please try again.'),
        }),
      );
    }
  };

  const canGoBack = Boolean(route.params?.fromCustomerDetail);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Record Collection"
        showBack={canGoBack}
        showNotification={!canGoBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton
              height={200}
              borderRadius={14}
              style={{ marginBottom: 16 }}
            />
            <Skeleton
              height={250}
              borderRadius={14}
              style={{ marginBottom: 16 }}
            />
            <Skeleton height={50} borderRadius={12} />
          </View>
        ) : (
          <>
            {/* Customer Select Card */}
            <Card
              style={[styles.card, { borderColor: colors.border }]}
              variant="elevated"
              padding={16}
            >
              <Text
                style={[
                  typography.subtitle,
                  {
                    color: colors.textPrimary,
                    marginBottom: 10,
                    fontWeight: '700',
                  },
                ]}
              >
                Select Customer
              </Text>

              <View style={styles.customerPills}>
                {customers.map((c: AssignedCustomer) => {
                  const isSelected = selectedCustomer.id === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.customerPill,
                        {
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                          backgroundColor: isSelected
                            ? colors.primarySoft
                            : colors.surface,
                          borderRadius: radius.md,
                        },
                      ]}
                      onPress={() => {
                        setSelectedCustomer(c);
                        setAmount(String(c.pendingAmount));
                      }}
                    >
                      <Text
                        style={[
                          typography.bodySmall,
                          {
                            color: isSelected
                              ? colors.primary
                              : colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {c.name} ({c.loanId})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Amount & Mode Card */}
            <Card
              style={[styles.card, { borderColor: colors.border }]}
              variant="elevated"
              padding={16}
            >
              <CustomInput
                label="Collection Amount (₹)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="number-pad"
                leftIcon="credit-card"
              />

              <Text
                style={[
                  typography.subtitle,
                  {
                    color: colors.textPrimary,
                    marginBottom: 8,
                    fontWeight: '600',
                  },
                ]}
              >
                Payment Mode
              </Text>

              <View style={styles.modeRow}>
                {(['UPI', 'Cash', 'Cheque'] as const).map(mode => {
                  const isSelected = paymentMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.modeBtn,
                        {
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                          backgroundColor: isSelected
                            ? colors.primarySoft
                            : colors.surface,
                          borderRadius: radius.md,
                        },
                      ]}
                      onPress={() => setPaymentMode(mode)}
                    >
                      <Text
                        style={[
                          typography.subtitle,
                          {
                            color: isSelected
                              ? colors.primary
                              : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <CustomInput
                label="Remarks (Optional)"
                placeholder="e.g. Received April EMI via GPay"
                value={remarks}
                onChangeText={setRemarks}
                containerStyle={{ marginTop: 16 }}
              />

              <CustomButton
                title={
                  isSubmitting
                    ? 'Processing...'
                    : `Confirm & Record ${formatINR(parseFloat(amount) || 0)}`
                }
                onPress={handleSubmit}
                disabled={isSubmitting}
                variant="primary"
                style={styles.submitBtn}
                gradientColors={colors.buttonGradient}
              />
            </Card>
          </>
        )}
      </ScrollView>
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
  card: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  customerPills: {
    gap: 8,
  },
  customerPill: {
    padding: 12,
    borderWidth: 1.5,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  submitBtn: {
    marginTop: 8,
  },
});
