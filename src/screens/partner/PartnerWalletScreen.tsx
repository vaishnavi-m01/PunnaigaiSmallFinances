import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Modal,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { fetchPartnerWithdrawalsThunk, fetchPartnerTransactionsThunk, fetchPartnerDashboardThunk, setSelectedPartnershipCode, fetchPartnerPartnershipsThunk, requestPartnerWithdrawalThunk } from '../../store/partnerSlice';
import { showToast } from '../../store/toastSlice';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { useTranslation } from '../../context/LanguageContext';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { CustomInput } from '../../component/Common/CustomInput';
import { CustomButton } from '../../component/Common/CustomButton';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils';
import { ROUTES } from '../../constants/routes';
import { PartnerTransaction } from '../../types/models';
import { deleteWithdrawal } from '../../services/api/partnerApi';

const QUICK_AMOUNTS = [5000, 10000, 20000, 35000];

type DateFilter = 'All' | 'Today' | 'Week' | 'Month' | 'Year';
type DirectionFilter = 'All' | 'credit' | 'debit';

export const PartnerWalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const dispatch = useAppDispatch();
  const partner = useAppSelector(state => state.partner);
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterWidth, setFilterWidth] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const selectedIndex = React.useMemo(() => {
    if (!partner.partnerships) return 0;
    const index = partner.partnerships.findIndex(p => p.partnership_code === partner.selectedPartnershipCode);
    return index === -1 ? 0 : index;
  }, [partner.partnerships, partner.selectedPartnershipCode]);

  useEffect(() => {
    if (filterWidth > 0 && partner.partnerships?.length > 0) {
      const tabWidth = filterWidth / partner.partnerships.length;
      Animated.spring(slideAnim, {
        toValue: selectedIndex * tabWidth,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    }
  }, [selectedIndex, filterWidth, partner.partnerships?.length]);

  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('All');
  
  const [showDateModal, setShowDateModal] = useState(false);
  
  // Withdraw Modal State
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccessModal, setWithdrawSuccessModal] = useState(false);
  const [withdrawAmountError, setWithdrawAmountError] = useState('');

  const parsedWithdrawAmount = parseFloat(withdrawAmount) || 0;
  const availableBalance = partner.summary?.available_balance || 0;

  const handleQuickSelect = (val: number) => {
    const finalVal = Math.min(val, availableBalance);
    setWithdrawAmount(finalVal.toString());
  };

  const handleMaxSelect = () => {
    setWithdrawAmount(availableBalance.toString());
  };

  const handleWithdrawSubmit = () => {
    if (!parsedWithdrawAmount || parsedWithdrawAmount <= 0) {
      setWithdrawAmountError('Please enter a valid withdrawal amount.');
      return;
    }

    setIsWithdrawing(true);
    const withdrawalPayload = {
      amount: parsedWithdrawAmount,
      withdrawal_type: 'profit' as 'profit',
      notes: withdrawNotes,
      partnership_id: idToFetch,
    };
    
    console.log("Withdraw API Request Payload:", JSON.stringify(withdrawalPayload, null, 2));

    dispatch(
      requestPartnerWithdrawalThunk(withdrawalPayload)
    ).unwrap().then(() => {
      setIsWithdrawing(false);
      setWithdrawModalVisible(false);
      setWithdrawSuccessModal(true);
      setWithdrawAmount('');
      setWithdrawNotes('');
      fetchTransactions();
      if (idToFetch !== undefined) {
        dispatch(fetchPartnerDashboardThunk(idToFetch));
      }
    }).catch((err) => {
      setIsWithdrawing(false);
      dispatch(showToast({ type: 'error', title: 'Withdrawal Failed', message: err as string }));
    });
  };

  const handleDeleteWithdrawal = (tx: any) => {
    Alert.alert(
      'Delete Withdrawal',
      `Are you sure you want to delete this withdrawal of ${formatINR(tx.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Extract the id properly. The user said { "withdrawal_id": 12 }
              // Wait, tx.rawId might just be the transaction ID.
              // We'll pass rawId which we assigned when mapping transactions.
              await deleteWithdrawal({ withdrawal_id: tx.rawId });
              dispatch(showToast({ type: 'success', title: 'Success', message: 'Withdrawal deleted successfully' }));
              onRefresh();
            } catch (err: any) {
              dispatch(showToast({ type: 'error', title: 'Error', message: err?.response?.data?.message || err?.message || 'Failed to delete withdrawal' }));
            }
          }
        }
      ]
    );
  };

  let displayTitlePrefix = 'Total';
  if (partner.selectedPartnershipCode) {
    const p = partner.partnerships.find(pt => pt.partnership_code === partner.selectedPartnershipCode);
    const partnerName = partner.partners?.find(pt => pt.id === p?.partnership_id)?.name || p?.partnership_name;
    if (partnerName) {
      displayTitlePrefix = `${partnerName}'s`;
    }
  }

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

  const fetchTransactions = useCallback(async () => {
    let from_date: string | undefined = undefined;
    let to_date: string | undefined = undefined;
    
    const now = new Date();
    if (dateFilter === 'Today') {
      from_date = now.toISOString().split('T')[0];
      to_date = from_date;
    } else if (dateFilter === 'Week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      from_date = startOfWeek.toISOString().split('T')[0];
      to_date = now.toISOString().split('T')[0];
    } else if (dateFilter === 'Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      from_date = startOfMonth.toISOString().split('T')[0];
      to_date = now.toISOString().split('T')[0];
    } else if (dateFilter === 'Year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      from_date = startOfYear.toISOString().split('T')[0];
      to_date = now.toISOString().split('T')[0];
    }

    let apiDirection: string | undefined = undefined;
    if (directionFilter === 'credit') apiDirection = 'in';
    if (directionFilter === 'debit') apiDirection = 'out';

    console.log("Filtering transactions with params:", { from_date, to_date, direction: apiDirection, partnership_id: idToFetch });

    if (idToFetch === undefined) return;

    setIsFiltering(true);
    let promises: Promise<any>[] = [
      dispatch(fetchPartnerWithdrawalsThunk({ from_date, to_date, direction: apiDirection, partnership_id: idToFetch })),
      dispatch(fetchPartnerTransactionsThunk({ from_date, to_date, direction: apiDirection, partnership_id: idToFetch }))
    ];

    await Promise.all(promises);
    setIsFiltering(false);
  }, [dateFilter, directionFilter, idToFetch, dispatch]);

  // Fetch Dashboard only when idToFetch changes
  useEffect(() => {
    if (idToFetch !== undefined) {
      dispatch(fetchPartnerDashboardThunk(idToFetch));
    }
  }, [idToFetch, dispatch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    if (idToFetch !== undefined) {
      dispatch(fetchPartnerDashboardThunk(idToFetch));
    }
    await fetchTransactions();
    setIsRefreshing(false);
  }, [fetchTransactions]);

  // We no longer manually combine credits/debits. 
  // The API returns transactions under each partnership in partner.transactionsPartnerships.


  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title={t('Wallet') || 'Wallet'} 
        showBack={false} 
        rightComponent={
          <TouchableOpacity 
            style={[styles.dropdownBtn, { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, minWidth: 100, justifyContent: 'space-between', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' }]}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={[styles.dropdownBtnText, { flex: 1, textAlign: 'center' }]}>{dateFilter === 'All' ? (t('All Time') || 'All Time') : dateFilter}</Text>
            <AppIcon name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        } 
      />

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {isRefreshing ? (
            <View>
              <Skeleton height={150} borderRadius={20} style={{ marginBottom: 24 }} />
              <View style={styles.historyHeader}>
                <Skeleton height={24} width={150} borderRadius={8} />
                <Skeleton height={24} width={24} borderRadius={12} />
              </View>
              <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
              <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
              <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
            </View>
          ) : (
            <>
              {/* Partnership Filter */}
              {partner.partnerships && partner.partnerships.length > 0 && (
                <View 
                  style={styles.filterContainer}
                  onLayout={(e) => setFilterWidth(e.nativeEvent.layout.width - 6)}
                >
                  <Animated.View 
                    style={[
                      styles.slidingPill,
                      { 
                        width: `${100 / partner.partnerships.length}%`,
                        transform: [{ translateX: slideAnim }]
                      }
                    ]} 
                  />
                  {partner.partnerships.map((p, index) => {
                    const partnerName = partner.partners?.find(pt => pt.id === p.partnership_id)?.name || p.partnership_name;
                    const isSelected = selectedIndex === index;
                    return (
                      <TouchableOpacity
                        key={p.partnership_id}
                        style={styles.pillTab}
                        onPress={() => dispatch(setSelectedPartnershipCode(p.partnership_code))}
                        activeOpacity={1}
                      >
                        <Text style={[
                          styles.pillTabText,
                          isSelected && styles.pillTabTextActive
                        ]}>{partnerName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {partner.isLoading && !isRefreshing && (!partner.summary) ? (
                <View style={{ marginTop: 8 }}>
                  <Skeleton height={150} borderRadius={20} style={{ marginBottom: 24 }} />
                  <Skeleton height={24} width={150} borderRadius={8} style={{ marginBottom: 16 }} />
                  <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
                  <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
                </View>
              ) : (
                <>
                  {/* Comprehensive Financial Overview Grid */}
                  <View style={{ gap: 12, marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      {/* Available Balance */}
                      <View style={{ flex: 1, backgroundColor: '#F5F3FF', padding: 16, borderRadius: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' }}>
                            <AppIcon name="pocket" size={14} color="#7C3AED" />
                          </View>
                          <Text style={[typography.subtitle, { color: '#475569', marginLeft: 8 }]}>{t('Avail Balance') || 'Avail Balance'}</Text>
                        </View>
                        <Text style={[typography.h3, { color: '#0F172A', marginTop: 12 }]}>
                          {formatINR(partner?.summary?.available_balance ?? 0)}
                        </Text>
                      </View>
                      
                      {/* Total Profit */}
                      <View style={{ flex: 1, backgroundColor: '#F0F9FF', padding: 16, borderRadius: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' }}>
                            <AppIcon name="trending-up" size={14} color="#0284C7" />
                          </View>
                          <Text style={[typography.subtitle, { color: '#475569', marginLeft: 8 }]}>{t('Total Profit') || 'Total Profit'}</Text>
                        </View>
                        <Text style={[typography.h3, { color: '#0F172A', marginTop: 12 }]}>
                          {formatINR(partner?.summary?.total_profit ?? 0)}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      {/* Total Withdrawal */}
                      <View style={{ flex: 1, backgroundColor: '#FFF7ED', padding: 16, borderRadius: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFEDD5', justifyContent: 'center', alignItems: 'center' }}>
                            <AppIcon name="arrow-up-right" size={14} color="#EA580C" />
                          </View>
                          <Text style={[typography.subtitle, { color: '#475569', marginLeft: 8 }]}>{t('Total Withdraw') || 'Total Withdraw'}</Text>
                        </View>
                        <Text style={[typography.h3, { color: '#0F172A', marginTop: 12 }]}>
                          {formatINR(partner?.summary?.total_withdrawal ?? 0)}
                        </Text>
                      </View>
                      
                      {/* Total Investment */}
                      <View style={{ flex: 1, backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' }}>
                            <AppIcon name="briefcase" size={14} color="#059669" />
                          </View>
                          <Text style={[typography.subtitle, { color: '#475569', marginLeft: 8 }]}>{t('Total Invest') || 'Total Invest'}</Text>
                        </View>
                        <Text style={[typography.h3, { color: '#0F172A', marginTop: 12 }]}>
                          {formatINR(partner?.summary?.total_investment ?? 0)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Transaction History Header */}
                  <View style={styles.historyHeader}>
                    <Text style={[typography.h3, { color: '#0F172A' }]}>
                      {t('Transaction History') || 'Transaction History'}
                    </Text>
                  </View>

                  {/* Type Filter Chips */}
                  <View style={[styles.filterRow, { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 16 }]}>
                    {(['All', 'credit', 'debit'] as DirectionFilter[]).map((type) => (
                      <TouchableOpacity 
                        key={type} 
                        onPress={() => setDirectionFilter(type)}
                        style={[
                          { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
                          directionFilter === type && { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }
                        ]}
                      >
                        <Text style={[
                          styles.filterChipText, 
                          directionFilter === type && { color: '#047857' }
                        ]}>
                          {type === 'All' ? (t('All') || 'All') : type === 'credit' ? (t('Credit (+)') || 'Credit (+)') : (t('Debit (-)') || 'Debit (-)')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Transaction List Grouped by Partner */}
                  <View style={styles.txList}>
                    {(partner.isLoading || isFiltering) && partner.summary ? (
                      <View style={{ marginTop: 8 }}>
                        <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
                        <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
                        <Skeleton height={80} borderRadius={16} style={{ marginBottom: 8 }} />
                      </View>
                    ) : partner.transactionsPartnerships && partner.transactionsPartnerships.some(p => p.transactions && p.transactions.length > 0) ? (
                      partner.transactionsPartnerships.map(p => {
                        const partnerName = partner.partners?.find(pt => pt.id === p.partnership_id)?.name || p.partnership_name;
                        
                        const txs = (p.transactions || []).map((t: any) => ({
                          id: `tx_${t.id}`,
                          rawId: t.transactionable_id || t.id,
                          title: t.description || t.transaction_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                          subtitle: t.transaction_code,
                          amount: Number(t.amount),
                          date: formatDate(t.transaction_date),
                          type: t.direction === 'in' ? 'credit' : 'debit',
                          icon: t.direction === 'in' ? 'arrow-down-circle' : 'arrow-up-circle',
                          iconColor: t.direction === 'in' ? '#10B981' : '#EF4444',
                          iconBg: t.direction === 'in' ? '#D1FAE5' : '#FEE2E2',
                        }));

                        if (txs.length === 0) return null;

                        return (
                          <View key={`tx_group_${p.partnership_id}`} style={{ marginBottom: 24 }}>
                            <Text style={[typography.h3, { color: '#0F172A', marginBottom: 16, marginTop: 8 }]}>
                              {partnerName} {t('s Transactions') || "'s Transactions"}
                            </Text>
                            {txs.map((tx) => (
                              <View key={tx.id} style={[styles.txCard, { backgroundColor: colors.white, marginBottom: 8 }]}>
                                <View style={styles.txLeft}>
                                  <View style={[styles.txIconBox, { backgroundColor: tx.iconBg }]}>
                                    <AppIcon name={tx.icon} size={18} color={tx.iconColor} />
                                  </View>
                                  <View style={{ flex: 1, paddingRight: 8 }}>
                                    <Text style={[typography.subtitle, { color: '#0F172A' }]} numberOfLines={1}>
                                      {tx.title}
                                    </Text>
                                    <Text style={[typography.caption, { color: '#64748B', marginTop: 2 }]} numberOfLines={1}>
                                      {tx.subtitle}
                                    </Text>
                                  </View>
                                  {tx.type === 'debit' && (
                                    <TouchableOpacity 
                                      style={{ padding: 4, marginRight: 8 }}
                                      onPress={() => handleDeleteWithdrawal(tx)}
                                    >
                                      <AppIcon name="trash-2" size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                  )}
                                </View>
                                <View style={styles.txRight}>
                                  <Text style={[
                                    typography.subtitle, 
                                    { color: tx.type === 'credit' ? '#10B981' : '#EF4444' }
                                  ]}>
                                    {tx.type === 'credit' ? '+ ' : '- '}{formatINR(tx.amount)}
                                  </Text>
                                  <Text style={[typography.caption, { color: '#64748B', marginTop: 2 }]}>
                                    {tx.date}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        );
                      })
                    ) : (
                      <View style={{ padding: 24, alignItems: 'center' }}>
                        <Text style={[typography.body, { color: colors.textSecondary }]}>No transactions found.</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>

      {/* Floating Action Button for Withdraw */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: '#0D523B' }]}
        onPress={() => setWithdrawModalVisible(true)}
        activeOpacity={0.8}
      >
        <AppIcon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Sheet Modal for Withdraw */}
      <Modal visible={withdrawModalVisible} transparent animationType="slide" onRequestClose={() => setWithdrawModalVisible(false)}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalDismiss} activeOpacity={1} onPress={() => setWithdrawModalVisible(false)} />
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom || 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>{t('Withdraw Partner Earnings') || 'Withdraw Earnings'}</Text>
                  <TouchableOpacity onPress={() => setWithdrawModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <AppIcon name="x-circle" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Amount Section */}
                <View style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[typography.bodyMedium, styles.label, { marginBottom: 0 }]}>{t('Enter Withdrawal Amount') || 'Enter Withdrawal Amount'} <Text style={{ color: colors.error }}>*</Text></Text>
                    <TouchableOpacity onPress={handleMaxSelect}>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>{t('WITHDRAW ALL') || 'WITHDRAW ALL'}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.inputBox, { borderColor: (withdrawAmountError || parsedWithdrawAmount > availableBalance) ? colors.error : colors.border }]}>
                    <Text style={[styles.currencyPrefix, { color: colors.textPrimary }]}>₹</Text>
                    <TextInput
                      style={[styles.numericInput, { color: colors.textPrimary }]}
                      value={withdrawAmount}
                      onChangeText={(val) => {
                        setWithdrawAmount(val);
                        if (withdrawAmountError) setWithdrawAmountError('');
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  {withdrawAmountError ? <Text style={[typography.caption, { color: colors.error, marginTop: 4 }]}>{withdrawAmountError}</Text> : null}
                  {(parsedWithdrawAmount > availableBalance) ? <Text style={[typography.caption, { color: colors.error, marginTop: 4 }]}>Amount exceeds available balance.</Text> : null}

                  {/* Quick Select Chips */}
                  <View style={styles.chipsContainer}>
                    {QUICK_AMOUNTS.map(val => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: parsedWithdrawAmount === val ? colors.primarySoft : colors.surfaceSubtle,
                            borderColor: parsedWithdrawAmount === val ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => handleQuickSelect(val)}>
                        <Text
                          style={[
                            typography.captionBold,
                            { color: parsedWithdrawAmount === val ? colors.primary : colors.textSecondary },
                          ]}>
                          +{formatINR(val)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Remarks Section */}
                <CustomInput
                  label={t('Remarks / Note (Optional)') || "Remarks / Note (Optional)"}
                  value={withdrawNotes}
                  onChangeText={setWithdrawNotes}
                  placeholder={t('e.g. Monthly profit share withdrawal') || "e.g. Monthly profit share withdrawal"}
                  multiline={true}
                  numberOfLines={4}
                />

                <CustomButton
                  title={isWithdrawing ? (t('Submitting Request...') || 'Submitting Request...') : `${t('Withdraw') || 'Withdraw'} ${formatINR(parsedWithdrawAmount)}`}
                  onPress={handleWithdrawSubmit}
                  variant="primary"
                  isLoading={isWithdrawing}
                  style={{ marginTop: 24, marginBottom: 8 }}
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <Modal visible={withdrawSuccessModal} transparent animationType="fade">
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalCard}>
            <View style={[styles.successIconCircle, { backgroundColor: colors.primarySoft }]}>
              <AppIcon name="check-circle" size={44} color={colors.primary} />
            </View>

            <Text style={[typography.h3, { color: colors.textPrimary, marginTop: 16, textAlign: 'center' }]}>
              {t('Partner Withdrawal Requested!') || 'Partner Withdrawal Requested!'}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              {t('has been submitted for finance approval and disbursement.') || 'Your request has been submitted for finance approval and disbursement.'}
            </Text>

            <CustomButton
              title="Done"
              onPress={() => setWithdrawSuccessModal(false)}
              variant="primary"
              style={{ marginTop: 20, width: '100%' }}
            />
          </View>
        </View>
      </Modal>

      {/* Date Modal (Popover) */}
      <Modal visible={showDateModal} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDateModal(false)} activeOpacity={1}>
          <View style={{
            position: 'absolute',
            top: Math.max(insets.top, 8) + 52 + 4,
            right: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 4,
            width: 160,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: '#F1F5F9',
          }}>
            {(['All', 'Today', 'Week', 'Month', 'Year'] as DateFilter[]).map((period, index) => (
              <TouchableOpacity 
                key={period}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderBottomWidth: index !== 4 ? 1 : 0,
                  borderBottomColor: '#F8FAFC',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => { setDateFilter(period); setShowDateModal(false); }}
              >
                <Text style={[typography.body, { color: dateFilter === period ? '#10B981' : '#475569', fontWeight: dateFilter === period ? 'bold' : 'normal' }]}>
                  {period === 'All' ? 'All Time' : period}
                </Text>
                {dateFilter === period && <AppIcon name="check" size={16} color="#10B981" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 100, // accommodate FAB
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
  balanceCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  txList: {
    gap: 8,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#047857',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  dropdownBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  successModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  successModalCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
