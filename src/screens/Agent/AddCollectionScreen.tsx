import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { CustomButton } from '../../component/Common/CustomButton';
import { AppIcon } from '../../component/AppIcon';
import { recordCollectionThunk } from '../../features/agent/collectionThunks';
import { showToast } from '../../store/toastSlice';
import { AssignedCustomer } from '../../types/models';


export const AddCollectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { colors, typography } = useAppTheme();

  const customers = useAppSelector(state => state.agent.assignedCustomers);
  const defaultCustomerId = route.params?.customerId || customers[0]?.id;
  const initialCustomer =
    customers.find((c: AssignedCustomer) => String(c.id) === String(defaultCustomerId)) ||
    customers[0];

  const [customerName, setCustomerName] = useState(initialCustomer?.name || 'Ramesh');
  const [loanId, setLoanId] = useState(initialCustomer?.loanId || 'L12345');
  const [paymentDate, setPaymentDate] = useState('15 Sep 2026');
  const [amount, setAmount] = useState(
    String(route.params?.defaultAmount || initialCustomer?.pendingAmount || '50000'),
  );
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [remarks, setRemarks] = useState('');
  const isSubmitting = useAppSelector(state => state.agent.isSubmittingCollection);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
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
      if (initialCustomer) {
        const numAdvanceAmount = parseFloat(advanceAmount.replace(/[^0-9.]/g, '')) || undefined;
        await dispatch(
          recordCollectionThunk({
            customerName: initialCustomer.name,
            customerId: initialCustomer.id,
            loanId: initialCustomer.loanId,
            amount: numAmount,
            advanceAmount: numAdvanceAmount,
            paymentMethod: paymentMode as any,
            remarks,
          }),
        ).unwrap();
      }
      dispatch(
        showToast({
          type: 'success',
          title: 'Collection Recorded',
          message: 'Successfully recorded the collection.',
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

  const dynamicStyles = StyleSheet.create({
    headerTitleText: {
      color: colors.white,
    },
    inputContainer: {
      backgroundColor: colors.white,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header title="Add Collection" showBack={true} />
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={[typography.bodyMedium, styles.label]}>
              Customer Name
            </Text>
            <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
              <TextInput
                style={[styles.input, typography.bodyLarge, styles.inputText]}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[typography.bodyMedium, styles.label]}>
              Loan ID
            </Text>
            <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
              <TextInput
                style={[styles.input, typography.bodyLarge, styles.inputText]}
                value={loanId}
                onChangeText={setLoanId}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[typography.bodyMedium, styles.label]}>
              Payment Date
            </Text>
            <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
              <TextInput
                style={[styles.input, typography.bodyLarge, styles.inputText]}
                value={paymentDate}
                onChangeText={setPaymentDate}
              />
              <AppIcon name="calendar" size={20} color="#94A3B8" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[typography.bodyMedium, styles.label]}>
              Collected Amount
            </Text>
            <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
              <Text style={[typography.bodyLarge, styles.currencyText]}>₹</Text>
              <TextInput
                style={[styles.input, typography.bodyLarge, styles.inputText]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[typography.bodyMedium, styles.label]}>
              Advance Amount (Optional)
            </Text>
            <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
              <Text style={[typography.bodyLarge, styles.currencyText]}>₹</Text>
              <TextInput
                style={[styles.input, typography.bodyLarge, styles.inputText]}
                value={advanceAmount}
                onChangeText={setAdvanceAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[typography.bodyMedium, styles.label]}>
              Payment Method
            </Text>
            <View style={styles.paymentMethodsRow}>
              {(['Cash', 'UPI', 'Bank Transfer'] as const).map(mode => {
                const isSelected = paymentMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.paymentMethodPill,
                      isSelected ? styles.pillSelected : styles.pillUnselected,
                      !isSelected && { backgroundColor: colors.white }
                    ]}
                    onPress={() => setPaymentMode(mode)}
                  >
                    <Text
                      style={[
                        typography.bodyMedium,
                        isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[typography.bodyMedium, styles.label]}>
              Remarks
            </Text>
            <View style={[styles.textAreaContainer, dynamicStyles.inputContainer]}>
              <TextInput
                style={[styles.textArea, typography.bodyMedium, styles.inputText]}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Enter remarks..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <CustomButton
            title={isSubmitting ? 'Processing...' : 'Submit Collection'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            variant="primary"
            size="large"
            style={styles.submitBtn}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#64748B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    height: '100%',
  },
  inputText: {
    color: '#0F172A',
  },
  currencyText: {
    color: '#0F172A',
    marginRight: 8,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentMethodPill: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  pillSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  pillUnselected: {
    borderColor: '#E2E8F0',
  },
  pillTextSelected: {
    color: '#166534',
    fontWeight: '700',
  },
  pillTextUnselected: {
    color: '#64748B',
    fontWeight: '500',
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 100,
    borderColor: '#E2E8F0',
  },
  textArea: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 12,
  },
});
