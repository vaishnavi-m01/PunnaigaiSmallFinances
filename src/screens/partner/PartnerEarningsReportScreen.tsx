import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { typography } from '../../theme/typography';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { useTranslation } from '../../context/LanguageContext';
import {
  fetchPartnerDashboardThunk,
  fetchPartnerContributionsThunk,
  addPartnerContributionThunk,
  setSelectedPartnershipCode,
  fetchPartnerPartnershipsThunk,
  fetchPartnerEarningsThunk,
} from '../../store/partnerSlice';
import { showToast } from '../../store/toastSlice';
import { CustomButton } from '../../component/Common/CustomButton';
import { CustomInput } from '../../component/Common/CustomInput';
import { Skeleton } from '../../component/Common/Skeleton';
import { Header } from '../../component';

export const PartnerEarningsReportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius } = useAppTheme();
  const partner = useAppSelector(state => state.partner);
  const user = useAppSelector((state: any) => state.auth.user);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>(
    'Select payment method',
  );
  const [notes, setNotes] = useState('');
  const [contributionDate, setContributionDate] = useState(() => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getFullYear()}`;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amountError, setAmountError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [dateError, setDateError] = useState('');
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterWidth, setFilterWidth] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const orderedPartnerships = React.useMemo(() => {
    if (!partner.partnerships) return [];
    const pList = [...partner.partnerships];
    pList.sort((a, b) => {
      const nameA = a.partner?.name || a.partnership_name;
      const nameB = b.partner?.name || b.partnership_name;
      if (nameA === user?.name) return -1;
      if (nameB === user?.name) return 1;
      return 0;
    });
    return pList;
  }, [partner.partnerships, partner.partners, user]);

  const selectedIndex = React.useMemo(() => {
    if (!orderedPartnerships) return 0;
    const index = orderedPartnerships.findIndex(
      p => p.partnership_code === partner.selectedPartnershipCode,
    );
    return index === -1 ? 0 : index;
  }, [orderedPartnerships, partner.selectedPartnershipCode]);

  const [initialSelectDone, setInitialSelectDone] = useState(false);
  useEffect(() => {
    if (!initialSelectDone && orderedPartnerships.length > 0) {
      if (!partner.selectedPartnershipCode) {
        dispatch(
          setSelectedPartnershipCode(orderedPartnerships[0].partnership_code),
        );
      }
      setInitialSelectDone(true);
    }
  }, [
    orderedPartnerships,
    initialSelectDone,
    partner.selectedPartnershipCode,
    dispatch,
  ]);

  const isCurrentUserSelected = React.useMemo(() => {
    if (!orderedPartnerships || !user) return false;
    const p = orderedPartnerships[selectedIndex];
    if (!p) return false;
    const partnerName = p.partner?.name || p.partnership_name;
    return partnerName === user.name;
  }, [orderedPartnerships, selectedIndex, user, partner.partners]);

  useEffect(() => {
    if (filterWidth > 0 && orderedPartnerships.length > 0) {
      const tabWidth = filterWidth / orderedPartnerships.length;
      Animated.spring(slideAnim, {
        toValue: selectedIndex * tabWidth,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    }
  }, [selectedIndex, filterWidth, orderedPartnerships.length]);

  let displayTitlePrefix = 'Total';
  if (partner.selectedPartnershipCode) {
    const p = partner.partnerships.find(
      pt => pt.partnership_code === partner.selectedPartnershipCode,
    );
    const partnerName = p?.partner?.name || p?.partnership_name;
    if (partnerName) {
      displayTitlePrefix = `${partnerName}'s`;
    }
  }

  const idToFetch = React.useMemo(() => {
    const selectedP = partner.partnerships?.find(
      p => p.partnership_code === partner.selectedPartnershipCode,
    );
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
    }, [dispatch]),
  );

  const fetchEarnings = useCallback(async () => {
    if (idToFetch === undefined) return;

    // Use setTimeout instead of InteractionManager
    setTimeout(async () => {
      setIsFiltering(true);

      // Run sequentially to avoid potential backend concurrent request lock issues
      await dispatch(fetchPartnerDashboardThunk({ partnership_id: idToFetch }));
      await dispatch(
        fetchPartnerContributionsThunk({ partnership_id: idToFetch }),
      );
      await dispatch(fetchPartnerEarningsThunk({ partnership_id: idToFetch }));

      setIsFiltering(false);
    }, 150);
  }, [idToFetch, dispatch]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    if (idToFetch !== undefined) {
      await Promise.all([
        dispatch(fetchPartnerDashboardThunk({ partnership_id: idToFetch })),
        dispatch(fetchPartnerContributionsThunk({ partnership_id: idToFetch })),
      ]);
    }
    setIsRefreshing(false);
  }, [dispatch, idToFetch]);

  const filteredContributions = partner.selectedPartnershipCode
    ? (partner.contributions || []).filter(
      c => (c as any).partnership_code === partner.selectedPartnershipCode,
    )
    : partner.contributions || [];

  const investmentHistory = filteredContributions.map(c => ({
    id: String(c.id),
    title: c.notes || 'Capital Investment',
    date: new Date(c.contribution_date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: new Date(c.contribution_date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    amount: Number(c.amount),
    status: c.status,
  }));

  const handleAddInvestment = () => {
    let hasError = false;
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));

    if (!numAmount || numAmount <= 0) {
      setAmountError(
        t('Please enter a valid investment amount.') ||
        'Please enter a valid investment amount.',
      );
      hasError = true;
    } else {
      setAmountError('');
    }

    if (!paymentMethod || paymentMethod === 'Select payment method') {
      setPaymentError(
        t('Please select an item in the list.') ||
        'Please select an item in the list.',
      );
      hasError = true;
    } else {
      setPaymentError('');
    }

    if (!contributionDate) {
      setDateError(
        t('Please enter a valid date.') || 'Please enter a valid date.',
      );
      hasError = true;
    } else {
      setDateError('');
    }

    if (hasError) return;

    setIsSubmitting(true);
    let backendDate = contributionDate;
    if (contributionDate.includes('-')) {
      const parts = contributionDate.split('-');
      if (parts.length === 3 && parts[2].length === 4) {
        // DD-MM-YYYY
        backendDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const payload = {
      amount: numAmount,
      payment_method: paymentMethod,
      contribution_date: backendDate,
      reference_number: 'null',
      notes: notes || 'Capital contribution',
      partnership_id: idToFetch,
    };

    console.log(
      'New Investment API Request Payload:',
      JSON.stringify(payload, null, 2),
    );

    dispatch(addPartnerContributionThunk(payload))
      .unwrap()
      .then(() => {
        setIsSubmitting(false);
        setModalVisible(false);
        setAmount('');
        setPaymentMethod('Select payment method');
        setNotes('');
        dispatch(
          showToast({
            type: 'success',
            title: 'Success',
            message: 'Investment added successfully.',
          }),
        );
        dispatch(fetchPartnerContributionsThunk({ partnership_id: idToFetch }));
      })
      .catch(err => {
        setIsSubmitting(false);
        dispatch(
          showToast({ type: 'error', title: 'Error', message: err as string }),
        );
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={t('My Investment') || 'My Investment'}
        showBack={false}
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
        {partner.isLoading && !isRefreshing && !partner.summary ? (
          <View style={{ marginTop: 8 }}>
            <Skeleton
              height={150}
              borderRadius={20}
              style={{ marginBottom: 24 }}
            />
            <Skeleton
              height={24}
              width={150}
              borderRadius={8}
              style={{ marginBottom: 16 }}
            />
            <Skeleton
              height={80}
              borderRadius={16}
              style={{ marginBottom: 8 }}
            />
            <Skeleton
              height={80}
              borderRadius={16}
              style={{ marginBottom: 8 }}
            />
          </View>
        ) : (
          <>
            {/* Partnership Filter */}
            {orderedPartnerships && orderedPartnerships.length > 0 && (
              <View
                style={styles.filterContainer}
                onLayout={e => setFilterWidth(e.nativeEvent.layout.width - 6)}
              >
                <Animated.View
                  style={[
                    styles.slidingPill,
                    {
                      width: `${100 / orderedPartnerships.length}%`,
                      transform: [{ translateX: slideAnim }],
                    },
                  ]}
                />
                {orderedPartnerships.map((p, index) => {
                  const partnerName = p.partner?.name || p.partnership_name;
                  const isSelected = selectedIndex === index;
                  return (
                    <TouchableOpacity
                      key={p.partnership_id}
                      style={styles.pillTab}
                      onPress={() =>
                        dispatch(setSelectedPartnershipCode(p.partnership_code))
                      }
                      activeOpacity={1}
                    >
                      <Text
                        style={[
                          styles.pillTabText,
                          isSelected && styles.pillTabTextActive,
                        ]}
                      >
                        {partnerName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Active Investment Card */}
            <LinearGradient
              colors={['#047857', '#064E3B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { overflow: 'hidden', borderRadius: 20 },
                ]}
                pointerEvents="none"
              >
                <View
                  style={{
                    position: 'absolute',
                    bottom: -40,
                    right: -20,
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: -20,
                    right: 60,
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }}
                />
              </View>
              <View style={styles.cardHeaderRow}>
                <View
                  style={[
                    styles.smallIconCircle,
                    { backgroundColor: 'rgba(255,255,255,0.2)' },
                  ]}
                >
                  <AppIcon name="briefcase" size={14} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    typography.subtitle,
                    { color: '#FFFFFF', marginLeft: 8, opacity: 0.9 },
                  ]}
                >
                  {displayTitlePrefix}{' '}
                  {t('Capital Invested') || 'Capital Invested'}
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    marginBottom: 12,
                  },
                ]}
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                {partner.isLoading && !isRefreshing ? (
                  <Skeleton
                    width={150}
                    height={32}
                    borderRadius={8}
                    style={{ opacity: 0.5 }}
                  />
                ) : (
                  <Text
                    style={[
                      typography.h1,
                      { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
                    ]}
                  >
                    {formatINR(
                      partner.summary?.total_investment ??
                      partner.summary?.contributions ??
                      0,
                    )}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#10B981',
                      marginRight: 6,
                    }}
                  />
                  <Text
                    style={[
                      typography.caption,
                      { color: '#FFFFFF', fontWeight: '600' },
                    ]}
                  >
                    Active
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Investment Agreement Details */}

            {/* Investment History Log */}
            <Text
              style={[
                typography.h3,
                { color: '#0F172A', marginBottom: 16, marginTop: 8 },
              ]}
            >
              {t('Investment History') || 'Investment History'}
            </Text>
            {(partner.isLoading || isFiltering) && partner.summary ? (
              <View style={{ marginTop: 8 }}>
                <Skeleton
                  height={80}
                  borderRadius={12}
                  style={{ marginBottom: 12 }}
                />
                <Skeleton
                  height={80}
                  borderRadius={12}
                  style={{ marginBottom: 12 }}
                />
                <Skeleton
                  height={80}
                  borderRadius={12}
                  style={{ marginBottom: 12 }}
                />
              </View>
            ) : investmentHistory.length === 0 ? (
              <View
                style={[
                  styles.historyCard,
                  {
                    backgroundColor: colors.white,
                    borderColor: '#E2E8F0',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 24,
                  },
                ]}
              >
                <Text style={[typography.caption, { color: '#64748B' }]}>
                  {t('No investments found') || 'No investment history found'}
                </Text>
              </View>
            ) : (
              investmentHistory.map(item => (
                <View
                  key={item.id}
                  style={[
                    styles.historyCard,
                    { backgroundColor: colors.white, borderColor: '#E2E8F0' },
                  ]}
                >
                  <View style={styles.historyLeft}>
                    <View
                      style={[
                        styles.historyIconBox,
                        { backgroundColor: '#F0FDF4' },
                      ]}
                    >
                      <AppIcon
                        name="arrow-down-left"
                        size={16}
                        color="#16A34A"
                      />
                    </View>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text
                        style={[typography.subtitle, { color: '#0F172A' }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          typography.caption,
                          { color: '#64748B', marginTop: 2 },
                        ]}
                        numberOfLines={1}
                      >
                        {item.date} • {item.time}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                      {formatINR(item.amount)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {isCurrentUserSelected && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: '#0D523B' }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <AppIcon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Bottom Sheet Modal for Add Investment */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalDismiss}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <View
              style={[styles.modalContent, { backgroundColor: colors.surface }]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom || 24 }}
              >
                <View style={styles.modalHeader}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>
                    {t('New Investment') || 'Add Investment'}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <AppIcon name="x" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[typography.bodyMedium, styles.label]}>
                    {t('Investment Amount') || 'Investment Amount'}{' '}
                    <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      {
                        borderColor: amountError ? colors.error : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.currencyPrefix,
                        { color: colors.textPrimary },
                      ]}
                    >
                      ₹
                    </Text>
                    <TextInput
                      style={[
                        styles.numericInput,
                        { color: colors.textPrimary },
                      ]}
                      value={amount}
                      onChangeText={val => {
                        setAmount(val);
                        setAmountError('');
                      }}
                      keyboardType="numeric"
                      placeholder="10000"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  {amountError ? (
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.error, marginTop: 4 },
                      ]}
                    >
                      {amountError}
                    </Text>
                  ) : null}
                </View>

                <View style={[styles.inputGroup, { zIndex: 10 }]}>
                  <Text style={[typography.bodyMedium, styles.label]}>
                    {t('Payment Method') || 'Payment Method'}{' '}
                    <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.inputBox,
                      {
                        borderColor: paymentError
                          ? colors.error
                          : colors.border,
                        justifyContent: 'space-between',
                        paddingHorizontal: 12,
                      },
                    ]}
                    onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        typography.bodyMedium,
                        {
                          color:
                            paymentMethod === 'Select payment method'
                              ? colors.textMuted
                              : colors.textPrimary,
                        },
                      ]}
                    >
                      {t(paymentMethod) || paymentMethod}
                    </Text>
                    <AppIcon
                      name={showPaymentDropdown ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>

                  {showPaymentDropdown && (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 8,
                        marginTop: 4,
                        backgroundColor: colors.white,
                      }}
                    >
                      {[
                        'Select payment method',
                        'Cash',
                        'Bank Transfer',
                        'UPI',
                        'Cheque',
                        'Other',
                      ].map((opt, index, arr) => (
                        <TouchableOpacity
                          key={opt}
                          style={{
                            padding: 12,
                            borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                            borderBottomColor: '#F1F5F9',
                          }}
                          onPress={() => {
                            setPaymentMethod(opt);
                            setShowPaymentDropdown(false);
                            setPaymentError('');
                          }}
                        >
                          <Text
                            style={[
                              typography.bodyMedium,
                              {
                                color:
                                  opt === 'Select payment method'
                                    ? colors.textMuted
                                    : colors.textPrimary,
                              },
                            ]}
                          >
                            {t(opt) || opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {paymentError ? (
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.error, marginTop: 4 },
                      ]}
                    >
                      {paymentError}
                    </Text>
                  ) : null}
                </View>

                <CustomInput
                  label={(t('Date') || 'Contribution Date') + ' *'}
                  value={contributionDate}
                  onChangeText={val => {
                    setContributionDate(val);
                    setDateError('');
                  }}
                  placeholder="16-09-2026"
                  leftIcon="calendar"
                  error={dateError}
                />

                <View style={{ marginTop: -8 }}>
                  <CustomInput
                    label={t('Notes (Optional)') || 'Notes (Optional)'}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={
                      t('Notes (Optional)') || 'Capital contribution'
                    }
                    leftIcon="file-text"
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>

                <CustomButton
                  title={
                    isSubmitting
                      ? '...'
                      : t('Confirm Investment') || 'Submit Investment'
                  }
                  onPress={handleAddInvestment}
                  isLoading={isSubmitting}
                  variant="primary"
                  style={{ marginTop: 24, marginBottom: 8 }}
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  heroCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 0,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#64748B',
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
  paymentMethodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentMethodPill: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
    position: 'relative',
  },
  slidingPill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pillTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pillTabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  pillTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  historyRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
