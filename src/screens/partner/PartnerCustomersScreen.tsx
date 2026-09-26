import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { showToast } from '../../store/toastSlice';
import { AppIcon } from '../../component/AppIcon';
import { Header } from '../../component/Header';
import {
  searchCustomers,
  collectPayment,
  addGivenAmount,
} from '../../services/api/partnerApi';
import { formatINR } from '../../utils/currency';
import { formatDate, formatDateToShortMonth } from '../../utils/date';
import { useTranslation } from '../../context/LanguageContext';

const FinanceCard = ({
  finance,
  schedules,
  typography,
  onCollectClick,
  onAddGivenClick,
  customer,
}: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pendingSchedules = schedules.filter((s: any) => s.status === 'pending');
  const firstTwoPendingIds = pendingSchedules.slice(0, 2).map((s: any) => s.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkIsCollectEnabled = (schedule: any) => {
    if (schedule.status !== 'pending' && schedule.status !== 'overdue') return false;
    if (schedule.status === 'overdue') return true;
    
    if (firstTwoPendingIds.includes(schedule.id)) return true;

    const dueDate = new Date(schedule.due_date);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate <= today) return true;

    return false;
  };
  const { t } = useTranslation();

  return (
    <View style={styles.financeContainer}>
      <TouchableOpacity
        style={styles.financeHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={styles.financeIconBox}>
            <AppIcon name="briefcase" size={14} color="#047857" />
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text
              style={[
                typography.caption,
                { color: '#0F172A', fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {finance.loan_package_name}
            </Text>
            <Text
              style={[typography.caption, { color: '#64748B' }]}
              numberOfLines={1}
            >
              {finance.finance_code} • {formatDate(finance.start_date)}
            </Text>
            {customer?.advance_balance > 0 && (
              <View
                style={{
                  backgroundColor: '#DBEAFE',
                  alignSelf: 'flex-start',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  marginTop: 4,
                }}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: '#2563EB', fontSize: 10, fontWeight: '700' },
                  ]}
                >
                  {t('Advance:') || 'Advance:'}{' '}
                  {formatINR(customer.advance_balance)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
            <Text style={[typography.caption, { color: '#64748B' }]}>
              {t('Outstanding') || 'Outstanding'}
            </Text>
            <Text
              style={[
                typography.bodyLarge,
                { color: '#EF4444', fontWeight: '800' },
              ]}
            >
              {formatINR(finance.outstanding_amount)}
            </Text>
          </View>
          <AppIcon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#94A3B8"
          />
        </View>
      </TouchableOpacity>

      {/* Repayment Schedules */}
      {isExpanded && schedules.length > 0 && (
        <View style={styles.schedulesWrapper}>
          <Text
            style={[
              typography.caption,
              { color: '#0F172A', fontWeight: '600', marginBottom: 6 },
            ]}
          >
            {t('Repayment Schedules') || 'Repayment Schedules'} (
            {schedules.filter((s: any) => s.status !== 'paid').length})
          </Text>

          {schedules.map((schedule: any) => {
            const isPending = schedule.status === 'pending';
            const isOverdue = schedule.status === 'overdue';
            
            let statusColor = '#10B981'; // default green (paid)
            let statusBg = '#D1FAE5';
            
            if (isPending) {
              statusColor = '#F59E0B';
              statusBg = '#FEF3C7';
            } else if (isOverdue) {
              statusColor = '#EF4444';
              statusBg = '#FEE2E2';
            }

            const isCollectEnabled = checkIsCollectEnabled(schedule);

            return (
              <View key={`sched_${schedule.id}`} style={styles.scheduleRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={[styles.statusPill, { backgroundColor: statusBg }]}
                    >
                      <Text
                        style={[
                          typography.caption,
                          {
                            color: statusColor,
                            fontWeight: '700',
                            fontSize: 10,
                          },
                        ]}
                      >
                        {schedule.status
                          ? schedule.status.toUpperCase()
                          : 'UNKNOWN'}
                      </Text>
                    </View>
                    <Text
                      style={[
                        typography.caption,
                        { color: '#475569', marginLeft: 8 },
                      ]}
                      numberOfLines={1}
                    >
                      {t('Due:') || 'Due:'}{' '}
                      <Text style={{ fontWeight: '600', color: '#0F172A' }}>
                        {formatDateToShortMonth(schedule.due_date)}
                      </Text>
                    </Text>
                  </View>
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: '#0F172A', fontWeight: '700' },
                    ]}
                  >
                    {formatINR(schedule.amount)}
                  </Text>

                  {/* Breakdown details */}
                  {(Number(schedule.balance_amount) > 0 || Number(schedule.penalty_amount) > 0) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
                      {Number(schedule.balance_amount) > 0 && (
                        <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 }}>
                          <Text style={[typography.caption, { color: '#475569', fontSize: 10, fontWeight: '700' }]}>
                            Bal: <Text style={{ color: '#0F172A' }}>{formatINR(schedule.balance_amount)}</Text>
                          </Text>
                        </View>
                      )}
                      {Number(schedule.penalty_amount) > 0 && (
                        <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 }}>
                          <Text style={[typography.caption, { color: '#991B1B', fontSize: 10, fontWeight: '700' }]}>
                            Pen: {formatINR(schedule.penalty_amount)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {(isPending || isOverdue) && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.smallCollectBtn,
                        !isCollectEnabled && {
                          opacity: 0.4,
                          borderColor: '#94A3B8',
                          backgroundColor: '#F1F5F9',
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() =>
                        isCollectEnabled && onCollectClick(schedule, customer)
                      }
                      disabled={!isCollectEnabled}
                    >
                      <Text
                        style={[
                          typography.caption,
                          {
                            color: isCollectEnabled ? '#059669' : '#64748B',
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {t('Collect') || 'Collect'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export const PartnerCustomersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<any>(null);

  // Collection Modal States
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [useAdvance, setUseAdvance] = useState(false);
  const [mode, setMode] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Given Amount Modal States
  const [givenAmountModalVisible, setGivenAmountModalVisible] = useState(false);
  const [givenAmount, setGivenAmount] = useState('');
  const [givenDate, setGivenDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [givenNote, setGivenNote] = useState('');
  const [isGivenSubmitting, setIsGivenSubmitting] = useState(false);

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length >= 3) {
      setIsLoading(true);
      try {
        const res = await searchCustomers(text);
        setCustomers(Array.isArray(res) ? res : res?.data || []);
      } catch (err: any) {
        console.log('Customer Search API Error:', err?.message || err);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCustomers([]);
    }
  };

  const getAvatarColor = (name: string) => {
    const avatarColors = [
      '#059669',
      '#0284C7',
      '#7C3AED',
      '#EA580C',
      '#DB2777',
    ];
    const charCode = (name || '').charCodeAt(0) || 0;
    return avatarColors[charCode % avatarColors.length];
  };

  const onCollectClick = (schedule: any, customer: any) => {
    setSelectedSchedule(schedule);
    setSelectedCustomer(customer);

    const dueAmount =
      Number(schedule.balance_amount) > 0
        ? schedule.balance_amount
        : schedule.amount || 0;
    const penDue = schedule.penalty_amount || 0;
    const custAdvance =
      customer?.advance_balance || schedule?.finance_advance || 0;
    const totalDue = dueAmount + penDue;
    const advanceUsed = Math.min(custAdvance, totalDue);

    setAmount((totalDue - advanceUsed).toString());
    setPenaltyAmount(penDue > 0 ? penDue.toString() : '');
    setAdvanceAmount('');
    setUseAdvance(true);
    setMode('Cash');
    setNotes('Collection via App');
    setCollectionDate(new Date());
    setCollectionModalVisible(true);
  };

  const handleToggleUseAdvance = (val: boolean) => {
    setUseAdvance(val);
    const dueAmt =
      Number(selectedSchedule?.balance_amount) > 0
        ? selectedSchedule?.balance_amount
        : selectedSchedule?.amount || 0;
    const custAdvance =
      selectedCustomer?.advance_balance ||
      selectedSchedule?.finance_advance ||
      0;
    if (val) {
      const advanceUsed = Math.min(custAdvance, dueAmt);
      setAmount((dueAmt - advanceUsed).toString());
    } else {
      setAmount(dueAmt.toString());
    }
  };

  const onAddGivenClick = (schedule: any, customer: any) => {
    setSelectedSchedule(schedule);
    setSelectedCustomer(customer);
    setGivenAmount('');
    setGivenDate(new Date().toISOString().split('T')[0]);
    setGivenNote('Payment received');
    setGivenAmountModalVisible(true);
  };

  const submitCollection = async () => {
    const dueAmt =
      Number(selectedSchedule?.balance_amount) > 0
        ? selectedSchedule?.balance_amount
        : selectedSchedule?.amount || 0;
    const colAmtNum = Number(amount) || 0;
    const penAmtNum = Number(penaltyAmount) || 0;
    const custAdvance =
      selectedCustomer?.advance_balance ||
      selectedSchedule?.finance_advance ||
      0;

    // Auto calculate advance stuff for backend payload based on the user's toggle and inputs
    const totalDue = dueAmt + penAmtNum;
    const advanceUsed = useAdvance ? Math.min(custAdvance, totalDue) : 0;
    const totalTransactionValue = colAmtNum + advanceUsed;

    if (totalTransactionValue <= 0 || isNaN(colAmtNum) || colAmtNum < 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid amount to collect (must be > 0 if not fully covered by advance).',
      );
      return;
    }

    setIsSubmitting(true);

    let remaining = colAmtNum + advanceUsed;
    const paidPen = Math.min(penAmtNum, remaining);
    remaining -= paidPen;
    const paidDue = Math.min(dueAmt, remaining);
    remaining -= paidDue;
    const advCreated = remaining > 0 ? remaining : 0;

    try {
      await collectPayment({
        customer_id: selectedCustomer.id,
        finance_id: selectedSchedule.finance_id,
        schedule_id: selectedSchedule.id,
        amount: Number(amount),
        advance_amount: advCreated > 0 ? advCreated : undefined,
        penalty_amount: penAmtNum > 0 ? penAmtNum : undefined,
        use_advance: useAdvance,
        mode,
        notes,
        collected_at: collectionDate.toISOString(),
      });
      setCollectionModalVisible(false);
      dispatch(
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Payment collected successfully!',
        }),
      );
      // Refresh list to reflect changes
      handleSearch(search);
    } catch (err: any) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Error',
          message:
            err?.response?.data?.message ||
            err?.message ||
            'Failed to collect payment',
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitGivenAmount = async () => {
    if (
      !givenAmount ||
      isNaN(Number(givenAmount)) ||
      Number(givenAmount) <= 0
    ) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    setIsGivenSubmitting(true);
    try {
      await addGivenAmount({
        customer_id: selectedCustomer.id,
        schedule_id: selectedSchedule.id,
        given_amount: Number(givenAmount),
        payment_date: givenDate,
        note: givenNote,
      });
      setGivenAmountModalVisible(false);
      dispatch(
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Given Amount added successfully!',
        }),
      );
      handleSearch(search);
    } catch (err: any) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Error',
          message:
            err?.response?.data?.message ||
            err?.message ||
            'Failed to add given amount',
        }),
      );
    } finally {
      setIsGivenSubmitting(false);
    }
  };

  const renderCustomerItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.customerCard, { backgroundColor: colors.white }]}>
        {/* Customer Header */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardLeft}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: getAvatarColor(item.name) },
              ]}
            >
              <Text
                style={[
                  typography.h2,
                  { color: colors.white, fontWeight: '700', fontSize: 20 },
                ]}
              >
                {(item.name || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={[typography.h3, { color: '#0F172A', fontWeight: '700' }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[typography.caption, { color: '#64748B', marginTop: 2 }]}
                numberOfLines={1}
              >
                {item.customer_code || item.id} • {item.mobile || item.phone}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'active' ? '#ECFDF5' : '#FEF2F2',
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: item.status === 'active' ? '#059669' : '#DC2626',
                  fontWeight: '600',
                },
              ]}
            >
              {item.status ? item.status.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>
        </View>

        {/* Loop through all active finances for this customer */}
        {item.finances && item.finances.length > 0 ? (
          item.finances.map((finance: any) => {
            const schedules =
              item.repayment_schedules?.filter(
                (s: any) => s.finance_id === finance.id,
              ) || [];
            return (
              <FinanceCard
                key={`finance_${finance.id}`}
                finance={finance}
                schedules={schedules}
                typography={typography}
                onCollectClick={onCollectClick}
                onAddGivenClick={onAddGivenClick}
                customer={item}
              />
            );
          })
        ) : (
          <View style={styles.noFinanceBox}>
            <Text
              style={[
                typography.bodyMedium,
                { color: '#64748B', textAlign: 'center' },
              ]}
            >
              {t('No active loans found.') || 'No active loans found.'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Simple Neat Header */}
      <Header
        title={t('Customers') || 'Customers'}
        showBack={true}
        showNotification={false}
      />

      {/* Search Bar inside the page */}
      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBox, isFocused ? styles.searchBoxFocused : null]}
        >
          <AppIcon
            name="search"
            size={20}
            color={isFocused ? '#047857' : '#94A3B8'}
          />
          <TextInput
            ref={searchInputRef}
            placeholder={
              t('Search by ID, name, or phone...') ||
              'Search by ID, name, or phone...'
            }
            value={search}
            onChangeText={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
              styles.searchInput,
              typography.bodyMedium,
              { color: '#0F172A' },
            ]}
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                Keyboard.dismiss();
              }}
            >
              <AppIcon name="x-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={customers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCustomerItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <AppIcon name="users" size={40} color="#94A3B8" />
              </View>
              <Text
                style={[
                  typography.h3,
                  { color: '#475569', marginTop: 16, textAlign: 'center' },
                ]}
              >
                {search.trim() === ''
                  ? t('Find a Customer') || 'Find a Customer'
                  : t('No customers found') || 'No customers found'}
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color: '#94A3B8',
                    textAlign: 'center',
                    marginTop: 8,
                    paddingHorizontal: 32,
                  },
                ]}
              >
                {search.trim() === ''
                  ? t(
                      'Use the search bar above to instantly find customer details.',
                    ) ||
                    'Use the search bar above to instantly find customer details.'
                  : `${
                      t("We couldn't find any match for") ||
                      "We couldn't find any match for"
                    } "${search}".`}
              </Text>
            </View>
          }
        />
      </View>

      {/* Bottom Sheet for Collection */}
      <Modal
        visible={collectionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCollectionModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setCollectionModalVisible(false)}
              activeOpacity={1}
            />
            <View
              style={[
                styles.modalContent,
                { paddingBottom: 0, maxHeight: '90%' },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom || 24 }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHeader}>
                  <Text
                    style={[
                      typography.h3,
                      { color: '#0F172A', fontWeight: '700' },
                    ]}
                  >
                    {t('Collect Payment') || 'Collect Payment'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCollectionModalVisible(false)}
                  >
                    <AppIcon name="x" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  {(() => {
                    const dueAmt =
                      Number(selectedSchedule?.balance_amount) > 0
                        ? selectedSchedule?.balance_amount
                        : selectedSchedule?.amount || 0;
                    const penDue = selectedSchedule?.penalty_amount || 0;
                    const penAmtNum = Number(penaltyAmount) || 0;
                    const custAdvance =
                      selectedCustomer?.advance_balance ||
                      selectedSchedule?.finance_advance ||
                      0;
                    const totalDue = dueAmt + penAmtNum;
                    const advanceUsed = useAdvance
                      ? Math.min(custAdvance, totalDue)
                      : 0;

                    const colAmtNum = Number(amount) || 0;
                    const remainingAdvance = useAdvance
                      ? custAdvance - advanceUsed
                      : custAdvance;

                    let remaining = colAmtNum + advanceUsed;
                    const paidPen = Math.min(penAmtNum, remaining);
                    remaining -= paidPen;
                    const paidDue = Math.min(dueAmt, remaining);
                    remaining -= paidDue;
                    const advCreated = remaining > 0 ? remaining : 0;

                    return (
                      <>
                        {/* Top Info Grid */}
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 12,
                            marginBottom: 16,
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              padding: 12,
                              backgroundColor: '#F8FAFC',
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: '#E2E8F0',
                            }}
                          >
                            <Text
                              style={[typography.caption, { color: '#64748B' }]}
                            >
                              {t('Due Amount') || 'Due Amount'}
                            </Text>
                            <Text
                              style={[
                                typography.h3,
                                { color: '#0F172A', fontWeight: '700' },
                              ]}
                            >
                              {formatINR(dueAmt)}
                            </Text>
                          </View>

                        </View>



                        <Text
                          style={[
                            typography.bodyMedium,
                            { color: '#475569', marginBottom: 4 },
                          ]}
                        >
                          {t('Collection Amount (₹)') ||
                            'Collection Amount (₹)'}
                        </Text>
                        <TextInput
                          style={styles.modalInput}
                          value={amount}
                          onChangeText={setAmount}
                          keyboardType="numeric"
                          placeholder="0.00"
                        />

                        {penDue > 0 && (
                          <View style={{ marginTop: 16 }}>
                            <Text
                              style={[
                                typography.bodyMedium,
                                { color: '#475569', marginBottom: 4 },
                              ]}
                            >
                              {t('Penalty Amount (₹)') || 'Penalty Amount (₹)'}
                            </Text>
                            <TextInput
                              style={styles.modalInput}
                              value={penaltyAmount}
                              onChangeText={val => {
                                setPenaltyAmount(val);
                                const newPen = Number(val) || 0;
                                const total = dueAmt + newPen;
                                const adv = useAdvance
                                  ? Math.min(custAdvance, total)
                                  : 0;
                                setAmount((total - adv).toString());
                              }}
                              keyboardType="numeric"
                              placeholder="0.00"
                            />
                          </View>
                        )}



                        <Text
                          style={[
                            typography.bodyMedium,
                            { color: '#475569', marginTop: 8, marginBottom: 4 },
                          ]}
                        >
                          {t('Payment Date') || 'Payment Date'}
                        </Text>
                        <TouchableOpacity
                          style={styles.modalInput}
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Text style={{ color: '#0F172A', fontSize: 16 }}>
                            {formatDate(collectionDate.toISOString())}
                          </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                          <DateTimePicker
                            value={collectionDate}
                            mode="date"
                            display={
                              Platform.OS === 'ios' ? 'spinner' : 'default'
                            }
                            onChange={(event: any, selectedDate?: Date) => {
                              setShowDatePicker(Platform.OS === 'ios');
                              if (selectedDate) setCollectionDate(selectedDate);
                            }}
                          />
                        )}

                        <Text
                          style={[
                            typography.bodyMedium,
                            {
                              color: '#475569',
                              marginTop: 16,
                              marginBottom: 4,
                            },
                          ]}
                        >
                          {t('Payment Mode') || 'Payment Mode'}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 10,
                            flexWrap: 'wrap',
                          }}
                        >
                          {['Cash', 'UPI', 'Cheque', 'Bank Transfer'].map(m => (
                            <TouchableOpacity
                              key={m}
                              style={[
                                styles.modeBtn,
                                mode === m && styles.modeBtnActive,
                              ]}
                              onPress={() => setMode(m)}
                            >
                              <Text
                                style={[
                                  typography.caption,
                                  {
                                    color: mode === m ? '#059669' : '#64748B',
                                    fontWeight: mode === m ? '700' : '500',
                                  },
                                ]}
                              >
                                {m}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <Text
                          style={[
                            typography.bodyMedium,
                            {
                              color: '#475569',
                              marginTop: 16,
                              marginBottom: 4,
                            },
                          ]}
                        >
                          {t('Notes (Optional)') || 'Notes (Optional)'}
                        </Text>
                        <TextInput
                          style={[
                            styles.modalInput,
                            { height: 80, textAlignVertical: 'top' },
                          ]}
                          value={notes}
                          onChangeText={setNotes}
                          placeholder="Add any remarks..."
                          multiline
                        />

                        {/* Payment Summary matching backend screenshot */}
                        <View
                          style={{
                            marginTop: 24,
                            padding: 16,
                            backgroundColor: '#FFF',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                          }}
                        >
                          <Text
                            style={[
                              typography.bodyMedium,
                              {
                                color: '#475569',
                                marginBottom: 16,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            {t('Payment Summary') || 'Payment Summary'}
                          </Text>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 12,
                            }}
                          >
                            <Text
                              style={[
                                typography.bodyMedium,
                                { color: '#475569' },
                              ]}
                            >
                              {t('Due Amount') || 'Due Amount'}
                            </Text>
                            <Text
                              style={[
                                typography.bodyMedium,
                                { color: '#0F172A', fontWeight: '600' },
                              ]}
                            >
                              {formatINR(dueAmt)}
                            </Text>
                          </View>

                          {penAmtNum > 0 && (
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 12,
                              }}
                            >
                              <Text
                                style={[
                                  typography.bodyMedium,
                                  { color: '#EF4444' },
                                ]}
                              >
                                {t('Penalty Amount') || 'Penalty Amount'}
                              </Text>
                              <Text
                                style={[
                                  typography.bodyMedium,
                                  { color: '#EF4444', fontWeight: '600' },
                                ]}
                              >
                                {formatINR(penAmtNum)}
                              </Text>
                            </View>
                          )}

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 12,
                            }}
                          >
                            <Text
                              style={[
                                typography.bodyMedium,
                                { color: '#059669' },
                              ]}
                            >
                              {t('Collection Amount') || 'Collection Amount'}
                            </Text>
                            <Text
                              style={[
                                typography.bodyMedium,
                                { color: '#059669', fontWeight: '600' },
                              ]}
                            >
                              {formatINR(colAmtNum)}
                            </Text>
                          </View>



                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              padding: 12,
                              backgroundColor: '#D1FAE5',
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={[
                                typography.bodyMedium,
                                { color: '#065F46', fontWeight: '700' },
                              ]}
                            >
                              {t('Total Payable Amount') ||
                                'Total Payable Amount'}
                            </Text>
                            <Text
                              style={[
                                typography.bodyMedium,
                                { color: '#065F46', fontWeight: '700' },
                              ]}
                            >
                              {formatINR(colAmtNum)}
                            </Text>
                          </View>
                        </View>
                      </>
                    );
                  })()}
                </View>

                <View
                  style={[
                    styles.modalFooter,
                    { paddingTop: 16, paddingBottom: 24 },
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                    onPress={submitCollection}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text
                        style={[
                          typography.bodyMedium,
                          { color: '#FFF', fontWeight: '700' },
                        ]}
                      >
                        {t('Confirm Collection') || 'Confirm Collection'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Given Amount Modal */}
      <Modal
        visible={givenAmountModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGivenAmountModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setGivenAmountModalVisible(false)}
              activeOpacity={1}
            />
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.white,
                  paddingBottom: 0,
                  maxHeight: '90%',
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom || 24 }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHeader}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>
                    {t('Add Given Amount') || 'Add Given Amount'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setGivenAmountModalVisible(false)}
                  >
                    <AppIcon name="x" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[typography.bodyMedium, styles.label]}>
                    {t('Given Amount *') || 'Given Amount *'}
                  </Text>
                  <View
                    style={[styles.inputBox, { borderColor: colors.border }]}
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
                      value={givenAmount}
                      onChangeText={setGivenAmount}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[typography.bodyMedium, styles.label]}>
                    {t('Payment Date *') || 'Payment Date *'}
                  </Text>
                  <View
                    style={[styles.inputBox, { borderColor: colors.border }]}
                  >
                    <TextInput
                      style={[
                        styles.numericInput,
                        { color: colors.textPrimary, paddingLeft: 12 },
                      ]}
                      value={givenDate}
                      onChangeText={setGivenDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[typography.bodyMedium, styles.label]}>
                    {t('Note') || 'Note'}
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      {
                        borderColor: colors.border,
                        height: 80,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        {
                          color: colors.textPrimary,
                          flex: 1,
                          textAlignVertical: 'top',
                        },
                      ]}
                      value={givenNote}
                      onChangeText={setGivenNote}
                      multiline={true}
                      placeholder={t('Enter note...') || 'Enter note...'}
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    isGivenSubmitting && { opacity: 0.7 },
                    { marginTop: 16 },
                  ]}
                  onPress={submitGivenAmount}
                  disabled={isGivenSubmitting}
                >
                  {isGivenSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text
                      style={[
                        typography.bodyMedium,
                        { color: colors.white, fontWeight: '700' },
                      ]}
                    >
                      {t('Submit') || 'Submit'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchBoxFocused: {
    borderColor: '#047857',
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    height: '100%',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  customerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  financeContainer: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  financeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  financeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  schedulesWrapper: {
    marginTop: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  smallCollectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  noFinanceBox: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modeBtnActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  modalFooter: {
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#475569',
    marginBottom: 6,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
  },
  currencyPrefix: {
    paddingLeft: 16,
    paddingRight: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  numericInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#047857',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});
