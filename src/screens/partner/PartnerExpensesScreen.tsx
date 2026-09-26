import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { Header } from '../../component/Header';
import { CustomInput } from '../../component/Common/CustomInput';
import { CustomButton } from '../../component/Common/CustomButton';
import Entypo from 'react-native-vector-icons/Entypo';
import { useTranslation } from '../../context/LanguageContext';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { 
  fetchExpenseCategoriesThunk, 
  fetchExpensesThunk, 
  createExpenseThunk, 
  updateExpenseThunk,
  removeExpenseThunk,
  clearExpenseError
} from '../../store/expenseSlice';
import { Expense } from '../../services/api/expenseApi';
import { showToast } from '../../store/toastSlice';

type DateFilter = 'All' | 'Today' | 'Week' | 'Month' | 'Year';

import DateTimePicker from '@react-native-community/datetimepicker';

export const PartnerExpensesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // Redux state
  const { categories, expenses, summary, isLoading, isSubmitting, hasFetchedCategories } = useAppSelector(state => state.expense);

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);

  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | number | null>(null);
  const [expenseCategoryId, setExpenseCategoryId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [dateError, setDateError] = useState('');
  
  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDisplayDate = (d: string) => {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return d;
  };

  // Initial Fetch Categories
  useEffect(() => {
    if (!hasFetchedCategories) {
      dispatch(fetchExpenseCategoriesThunk());
    }
  }, [dispatch, hasFetchedCategories]);

  // Fetch Expenses on filter change
  useEffect(() => {
    const fetchParams: any = {};
    if (selectedCategoryId !== 'All') {
      fetchParams.category_id = selectedCategoryId;
    }
    
    // Convert DateFilter to start_date / end_date (mocking logic for backend)
    if (dateFilter !== 'All') {
      const today = new Date();
      fetchParams.end_date = today.toISOString().split('T')[0];
      if (dateFilter === 'Today') {
        fetchParams.start_date = today.toISOString().split('T')[0];
      } else if (dateFilter === 'Week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        fetchParams.start_date = lastWeek.toISOString().split('T')[0];
      } else if (dateFilter === 'Month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        fetchParams.start_date = lastMonth.toISOString().split('T')[0];
      } else if (dateFilter === 'Year') {
        const lastYear = new Date(today);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        fetchParams.start_date = lastYear.toISOString().split('T')[0];
      }
    }

    dispatch(fetchExpensesThunk(fetchParams));
  }, [dispatch, selectedCategoryId, dateFilter]);


  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return 'tag';
    const lower = categoryName.toLowerCase();
    if (lower.includes('office')) return 'paperclip';
    if (lower.includes('travel')) return 'navigation';
    if (lower.includes('internet')) return 'wifi';
    if (lower.includes('food')) return 'coffee';
    return 'tag';
  };

  const openAddModal = () => {
    setEditingExpenseId(null);
    setAmount('');
    setExpenseCategoryId(categories.length > 0 ? categories[0].id : '');
    setDate(new Date().toISOString().split('T')[0]);
    setReference('');
    setDescription('');
    setAmountError('');
    setCategoryError('');
    setDateError('');
    setModalVisible(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setAmount(expense.amount.toString());
    setExpenseCategoryId(expense.category_id);
    setDate(expense.expense_date);
    setReference(expense.reference_number || '');
    setDescription(expense.description || '');
    setAmountError('');
    setCategoryError('');
    setDateError('');
    setModalVisible(true);
  };

  const confirmDelete = (id: string | number) => {
    Alert.alert("Delete Expense", "Are you sure you want to delete this expense record?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive",
        onPress: () => {
          dispatch(removeExpenseThunk(id))
            .unwrap()
            .then(() => dispatch(showToast({ type: 'success', title: 'Deleted', message: 'Expense deleted successfully.' })))
            .catch((err) => dispatch(showToast({ type: 'error', title: 'Error', message: err })));
        } 
      }
    ]);
  };

  const handleSaveExpense = () => {
    let hasError = false;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError(t('Please enter a valid amount.') || 'Please enter a valid amount.');
      hasError = true;
    } else {
      setAmountError('');
    }

    if (!expenseCategoryId) {
      setCategoryError(t('Please select a category.') || 'Please select a category.');
      hasError = true;
    } else {
      setCategoryError('');
    }

    if (!date) {
      setDateError(t('Please select a date.') || 'Please select a date.');
      hasError = true;
    } else {
      setDateError('');
    }

    if (hasError) return;

    const payload = {
      amount: Number(amount),
      category_id: expenseCategoryId,
      expense_date: date,
      reference_number: reference,
      description: description,
    };

    if (editingExpenseId) {
      // Update
      dispatch(updateExpenseThunk({ id: editingExpenseId, payload }))
        .unwrap()
        .then(() => {
          dispatch(showToast({ type: 'success', title: 'Success', message: 'Expense updated.' }));
          setModalVisible(false);
        })
        .catch((err) => dispatch(showToast({ type: 'error', title: 'Update Failed', message: err })));
    } else {
      // Create
      dispatch(createExpenseThunk(payload))
        .unwrap()
        .then(() => {
          dispatch(showToast({ type: 'success', title: 'Success', message: 'Expense added.' }));
          setModalVisible(false);
          // Refetch to ensure correct sorting/pagination
          dispatch(fetchExpensesThunk());
        })
        .catch((err) => dispatch(showToast({ type: 'error', title: 'Add Failed', message: err })));
    }
  };

  const renderExpenseCard = ({ item }: { item: Expense }) => (
    <View style={[styles.expenseCard, { backgroundColor: colors.white }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        
        {/* Left: Icon */}
        <View style={styles.categoryIconCircle}>
          <AppIcon name={getCategoryIcon(item.category_name)} size={14} color="#047857" />
        </View>
        
        {/* Middle: Details */}
        <View style={{ flex: 1, marginLeft: 10, marginRight: 8 }}>
          <Text style={[typography.bodyMedium, { color: '#0F172A', fontWeight: '700' }]} numberOfLines={1}>
            {item.category_name || 'Expense'}
          </Text>
          
          {item.description ? (
            <Text style={[typography.caption, { color: '#475569', marginTop: 2 }]} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <AppIcon name="calendar" size={10} color="#94A3B8" />
            <Text style={[typography.caption, { color: '#94A3B8', fontSize: 10, marginLeft: 4 }]}>
              {formatDisplayDate(item.expense_date)}
            </Text>
            {item.reference_number ? (
              <>
                <Text style={{ color: '#E2E8F0', marginHorizontal: 6 }}>|</Text>
                <Text style={[typography.caption, { color: '#94A3B8', fontSize: 10 }]}>
                  Ref: {item.reference_number}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Right: Amount & Actions */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[typography.bodyLarge, { color: '#EF4444', fontWeight: '800' }]}>
            {formatINR(item.amount)}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 10, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => openEditModal(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
               <Entypo name="edit" color="#047857" size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
               <AppIcon name="trash-2" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title={t('Expenses') || 'Expenses'} 
        showBack={false} 
        rightComponent={
          <TouchableOpacity 
            style={[styles.dropdownBtn, { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, minWidth: 100, justifyContent: 'space-between', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' }]}
            onPress={() => setShowDateFilterModal(true)}
          >
            <Text style={[styles.dropdownBtnText, { flex: 1, textAlign: 'center' }]}>{dateFilter === 'All' ? 'All Time' : dateFilter}</Text>
            <AppIcon name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        } 
      />

      {/* Filter Row */}
      <View style={[styles.filterSection, { backgroundColor: colors.white }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategoryId === 'All' 
                ? { backgroundColor: '#047857', borderColor: '#047857' }
                : { backgroundColor: colors.white, borderColor: '#E2E8F0' }
            ]}
            onPress={() => setSelectedCategoryId('All')}
          >
            <Text style={[
              typography.caption,
              { color: selectedCategoryId === 'All' ? colors.white : '#475569', fontWeight: '600' }
            ]}>
              {t('All') || 'All'}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                selectedCategoryId === cat.id 
                  ? { backgroundColor: '#047857', borderColor: '#047857' }
                  : { backgroundColor: colors.white, borderColor: '#E2E8F0' }
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[
                typography.caption,
                { color: selectedCategoryId === cat.id ? colors.white : '#475569', fontWeight: '600' }
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryInner}>
          <View>
            <Text style={[typography.caption, { color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }]}>{t('Total Expenses') || 'Total Expenses'}</Text>
            <Text style={[typography.bodyMedium, { color: '#0F172A', marginTop: 2 }]}>{summary.total_records} {t('records found') || 'records found'}</Text>
          </View>
          <Text style={[typography.h2, { color: '#047857', fontWeight: '800' }]}>{formatINR(summary.total_amount)}</Text>
        </View>
      </View>

      {/* Expenses List */}
      {isLoading && expenses.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#047857" />
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={item => item.id.toString()}
          renderItem={renderExpenseCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#F1F5F9' }]}>
                <AppIcon name="inbox" size={32} color="#94A3B8" />
              </View>
              <Text style={[typography.bodyLarge, { color: '#475569', marginTop: 16, fontWeight: '600' }]}>{t('No expenses found') || 'No expenses found'}</Text>
              <Text style={[typography.bodyMedium, { color: '#94A3B8', marginTop: 8, textAlign: 'center' }]}>
                {t('Try adjusting your filters or add a new expense.') || 'Try adjusting your filters or add a new expense.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: '#0D523B' }]}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <AppIcon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Sheet Modal for Add/Edit Expense */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalDismiss} activeOpacity={1} onPress={() => setModalVisible(false)} />
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom || 24 }}>
                <View style={styles.modalHeader}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <AppIcon name="x" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[typography.bodyMedium, styles.label]}>{t('Expense Amount')} <Text style={{ color: '#EF4444' }}>*</Text></Text>
                  <View style={[styles.inputBox, { borderColor: amountError ? '#EF4444' : colors.border }]}>
                    <Text style={[styles.currencyPrefix, { color: colors.textPrimary }]}>₹</Text>
                    <TextInput
                      style={[styles.numericInput, { color: colors.textPrimary }]}
                      value={amount}
                      onChangeText={(val) => { setAmount(val); setAmountError(''); }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  {amountError ? <Text style={[typography.caption, { color: '#EF4444', marginTop: 4 }]}>{amountError}</Text> : null}
                </View>

                <View style={[styles.inputGroup, { marginBottom: 16 }]}>
                  <Text style={[typography.bodyMedium, styles.label]}>{t('Category')} <Text style={{ color: '#EF4444' }}>*</Text></Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                     {categories.map((cat) => (
                       <TouchableOpacity
                         key={cat.id}
                         style={[
                           styles.categoryPill,
                           expenseCategoryId === cat.id 
                             ? { backgroundColor: '#047857', borderColor: '#047857' }
                             : { backgroundColor: colors.white, borderColor: categoryError ? '#EF4444' : '#E2E8F0' }
                         ]}
                         onPress={() => { setExpenseCategoryId(cat.id); setCategoryError(''); }}
                       >
                         <Text style={[
                           typography.caption,
                           { color: expenseCategoryId === cat.id ? colors.white : '#475569', fontWeight: '600' }
                         ]}>
                           {cat.name}
                         </Text>
                       </TouchableOpacity>
                     ))}
                  </ScrollView>
                  {categoryError ? <Text style={[typography.caption, { color: '#EF4444', marginTop: 4 }]}>{categoryError}</Text> : null}
                </View>

                <View style={{ marginTop: 0 }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={1}>
                    <View pointerEvents="none">
                      <CustomInput
                        label={(t('Date') || "Date") + " *"}
                        value={formatDisplayDate(date)}
                        onChangeText={() => {}}
                        placeholder="Select date"
                        leftIcon="calendar"
                        editable={false}
                        error={dateError}
                      />
                    </View>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={date ? new Date(date) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          setDate(formattedDate);
                          setDateError('');
                        }
                      }}
                    />
                  )}
                </View>

                <View style={{ marginTop: -8 }}>
                  <CustomInput
                    label="Reference Number (Optional)"
                    value={reference}
                    onChangeText={setReference}
                    placeholder="Invoice or voucher number"
                    leftIcon="file-text"
                  />
                </View>

                <View style={{ marginTop: -8 }}>
                  <CustomInput
                    label="Description (Optional)"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Bought pens and paper"
                    leftIcon="file-text"
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>

                <CustomButton
                  title={isSubmitting ? 'Processing...' : (editingExpenseId ? 'Save Changes' : 'Create Expense')}
                  onPress={handleSaveExpense}
                  isLoading={isSubmitting}
                  variant="primary"
                  style={{ marginTop: 16, marginBottom: 8 }}
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Modal (Popover) */}
      <Modal visible={showDateFilterModal} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDateFilterModal(false)} activeOpacity={1}>
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
                onPress={() => { setDateFilter(period); setShowDateFilterModal(false); }}
              >
                <Text style={[typography.body, dateFilter === period && { color: '#10B981', fontWeight: 'bold' }]}>
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
  container: { flex: 1 },
  filterSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 1,
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
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // extra padding for FAB
  },
  expenseCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooterDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
});
