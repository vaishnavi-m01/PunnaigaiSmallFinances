import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { CustomInput } from '../../component/Common/CustomInput';
import { CustomButton } from '../../component/Common/CustomButton';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { requestPartnerWithdrawalThunk, fetchPartnerWithdrawalsThunk, fetchPartnerDashboardThunk, fetchPartnerPartnershipsThunk } from '../../store/partnerSlice';
import { showToast } from '../../store/toastSlice';

const QUICK_AMOUNTS = [5000, 10000, 20000, 35000];

export const PartnerWithdrawScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { colors, typography, radius } = useAppTheme();
  const partner = useAppSelector(state => state.partner);

  const availableBalance = partner.summary?.available_balance || 0;

  const idToFetch = React.useMemo(() => {
    const selectedP = partner.partnerships?.find(p => p.partnership_code === partner.selectedPartnershipCode);
    return selectedP ? selectedP.partnership_id : undefined;
  }, [partner.partnerships, partner.selectedPartnershipCode]);

  // Unconditionally fetch partnerships on mount to ensure the filter is always perfectly synced
  useEffect(() => {
    dispatch(fetchPartnerPartnershipsThunk());
  }, [dispatch]);

  // On focus, get the list of partnerships unconditionally to ensure filter is always up to date
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchPartnerPartnershipsThunk());
    }, [dispatch])
  );

  // Automatically fetch screen data when the filter (idToFetch) changes
  useEffect(() => {
    if (idToFetch !== undefined) {
      dispatch(fetchPartnerWithdrawalsThunk({ partnership_id: idToFetch }));
    }
  }, [idToFetch, dispatch]);

  // Fetch Dashboard only when idToFetch changes
  useEffect(() => {
    if (idToFetch !== undefined) {
      dispatch(fetchPartnerDashboardThunk(idToFetch));
    }
  }, [idToFetch, dispatch]);

  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [amountError, setAmountError] = useState(false);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    setIsFiltering(true);
    if (idToFetch !== undefined) {
      await Promise.all([
        dispatch(fetchPartnerWithdrawalsThunk({ partnership_id: idToFetch })),
        dispatch(fetchPartnerDashboardThunk(idToFetch))
      ]);
    }
    setIsFiltering(false);
    setIsRefreshing(false);
  }, [dispatch, idToFetch]);

  const parsedAmount = parseFloat(amount) || 0;

  const handleQuickSelect = (val: number) => {
    const finalVal = Math.min(val, availableBalance);
    setAmount(finalVal.toString());
  };

  const handleMaxSelect = () => {
    setAmount(availableBalance.toString());
  };

  const handleSubmit = () => {
    if (!parsedAmount || parsedAmount <= 0) {
      setAmountError(true);
      dispatch(
        showToast({
          type: 'error',
          title: 'Invalid Amount',
          message: 'Please enter a valid withdrawal amount.',
        })
      );
      return;
    }


    setIsSubmitting(true);
    dispatch(
      requestPartnerWithdrawalThunk({
        amount: parsedAmount,
        withdrawal_type: 'profit',
        notes: remarks,
        partnership_id: idToFetch,
      })
    ).unwrap().then(() => {
      setIsSubmitting(false);
      setSuccessModal(true);
    }).catch((err) => {
      setIsSubmitting(false);
      dispatch(showToast({ type: 'error', title: 'Withdrawal Failed', message: err as string }));
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <Header title="Withdraw Partner Earnings" showBack={true} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
              {(partner.isLoading || isFiltering) && !isRefreshing && (!partner.summary) ? (
                <View style={{ marginTop: 8 }}>
                  <Skeleton height={150} borderRadius={20} style={{ marginBottom: 24 }} />
                  <Skeleton height={24} width={150} borderRadius={8} style={{ marginBottom: 16 }} />
                  <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
                  <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
                </View>
              ) : (
          <>


        {/* Amount Section */}
        <Card style={[styles.sectionCard, { borderColor: colors.border }]} variant="flat">
          <View style={styles.sectionHeaderRow}>
            <Text style={[typography.h4, { color: colors.textPrimary }]}>Enter Withdrawal Amount</Text>
            <TouchableOpacity onPress={handleMaxSelect}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>WITHDRAW ALL</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputBox, { borderColor: (amountError || parsedAmount > availableBalance) ? colors.error : colors.border }]}>
            <Text style={[styles.currencyPrefix, { color: colors.textPrimary }]}>₹</Text>
            <TextInput
              style={[styles.numericInput, { color: colors.textPrimary }]}
              value={amount}
              onChangeText={(val) => {
                setAmount(val);
                if (amountError) setAmountError(false);
              }}
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

        {/* Remarks Section */}
        <Card style={[styles.sectionCard, { borderColor: colors.border }]} variant="flat">
          <CustomInput
            label="Remarks / Note (Optional)"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="e.g. Monthly profit share withdrawal"
            multiline={true}
            numberOfLines={4}
          />
        </Card>



        </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Action Button */}
      <View style={[styles.stickyBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <CustomButton
          title={isSubmitting ? 'Submitting Request...' : `Withdraw ${formatINR(parsedAmount)}`}
          onPress={handleSubmit}
          variant="primary"
          isLoading={isSubmitting}
          gradientColors={colors.buttonGradient}
        />
      </View>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
            <View style={[styles.successIconCircle, { backgroundColor: colors.primarySoft }]}>
              <AppIcon name="check-circle" size={44} color={colors.primary} />
            </View>

            <Text style={[typography.h3, { color: colors.textPrimary, marginTop: 16, textAlign: 'center' }]}>
              Partner Withdrawal Requested!
            </Text>

            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              Your request for <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{formatINR(parsedAmount)}</Text> has been submitted for finance approval and disbursement.
            </Text>

            <View style={[styles.summaryBox, { backgroundColor: colors.surfaceSubtle }]}>
              <View style={styles.summaryRow}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Notes</Text>
                <Text style={[typography.captionBold, { color: colors.textPrimary }]} numberOfLines={1}>
                  {remarks || '-'}
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
    paddingBottom: 24, // Reduced because button is now sticky
  },
  stickyBottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
