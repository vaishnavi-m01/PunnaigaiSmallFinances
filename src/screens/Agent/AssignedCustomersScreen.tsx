import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { fetchAssignedCustomersThunk, recordCollectionThunk } from '../../features/agent/collectionThunks';
import { showToast } from '../../store/toastSlice';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { CustomButton } from '../../component/Common/CustomButton';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { ROUTES } from '../../constants/routes';
import { AssignedCustomer } from '../../types/models';


export const AssignedCustomersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { colors, typography } = useAppTheme();

  const customers = useAppSelector(state => state.agent.assignedCustomers);
  const isLoading = useAppSelector(state => state.agent.isLoading);
  const isSubmitting = useAppSelector(state => state.agent.isSubmittingCollection);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Quick Collect Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<AssignedCustomer | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    dispatch(fetchAssignedCustomersThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchAssignedCustomersThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const filtered = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.loanId.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    if (!matchesSearch) return false;
    return true;
  });

  const handleOpenCollect = (customer: AssignedCustomer) => {
    setSelectedCustomer(customer);
    setAmount(String(customer.pendingAmount || 50000));
    setPaymentMode('Cash');
    setRemarks('');
  };

  const handleSubmitCollection = async () => {
    if (!selectedCustomer) return;
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!numAmount || numAmount <= 0) {
      dispatch(showToast({ type: 'error', title: 'Invalid Amount', message: 'Please enter a valid amount.' }));
      return;
    }

    try {
      await dispatch(
        recordCollectionThunk({
          customerName: selectedCustomer.name,
          customerId: selectedCustomer.id,
          loanId: selectedCustomer.loanId,
          amount: numAmount,
          paymentMethod: paymentMode as any,
          remarks,
        }),
      ).unwrap();
      dispatch(showToast({ type: 'success', title: 'Collection Recorded', message: 'Successfully recorded the collection.' }));
      setSelectedCustomer(null); // Close modal
    } catch (error) {
      dispatch(showToast({ type: 'error', title: 'Collection Failed', message: String(error || 'Unable to record collection. Please try again.') }));
    }
  };

  const getAvatarColor = (name: string) => {
    const avatarColors = ['#8B5CF6', '#F97316', '#3B82F6', '#EC4899', '#14B8A6'];
    const charCode = name.charCodeAt(0) || 0;
    return avatarColors[charCode % avatarColors.length];
  };

  const renderCustomerItem = ({ item }: { item: AssignedCustomer }) => {
    const pendingAmount = item.pendingAmount || 0;
    const hasDueDate = !!item.dueDate;
    const formattedDueDate = hasDueDate ? formatDate(item.dueDate) : null;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.customerCard, { backgroundColor: colors.white }]}
        onPress={() => navigation.navigate(ROUTES.CUSTOMER_DETAIL_VIEW, { customerId: item.id })}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardLeft}>
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
              <Text style={[typography.h3, { color: colors.white }]}>
                {item.name.charAt(0)}
              </Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {item.name}
              </Text>
              <Text style={[typography.caption, { color: '#64748B', marginTop: 2 }]}>
                {item.phone}
              </Text>
              {formattedDueDate && (
                <View style={styles.dueDateRow}>
                  <AppIcon name="calendar" size={10} color={item.isOverdue ? '#EF4444' : '#64748B'} />
                  <Text style={[typography.caption, { color: item.isOverdue ? '#EF4444' : '#64748B', marginLeft: 3, fontSize: 10 }]}>
                    Due: {formattedDueDate}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: !item.isOverdue ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[typography.caption, { color: !item.isOverdue ? '#16A34A' : '#EF4444' }]}>
              {!item.isOverdue ? 'Active' : 'Overdue'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={[typography.caption, { color: '#64748B' }]}>Next Instalment</Text>
            <Text style={[typography.bodyLarge, { color: '#0F172A', fontWeight: '700', marginTop: 4 }]}>
              {formatINR(pendingAmount)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.collectBtn, { backgroundColor: '#10B981' }]}
            onPress={() => handleOpenCollect(item)}
            activeOpacity={0.8}
          >
            <Text style={[typography.caption, { color: colors.white, fontWeight: '700' }]}>Collect</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />

      {isSearchActive ? (
        <View style={[styles.searchHeader, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
          <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearch(''); }}>
            <AppIcon name="arrow-left" size={24} color="#0D523B" />
          </TouchableOpacity>
          
          <TextInput
            placeholder="Search by name or phone..."
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, typography.bodyMedium, { color: '#0F172A' }]}
            placeholderTextColor="#94A3B8"
            autoFocus
          />
          <TouchableOpacity onPress={() => setSearch('')}>
            <AppIcon name="x" size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      ) : (
        <Header 
          title="Assigned Customers" 
          showBack={false} 
          showNotification={true}
          rightComponent={
            <TouchableOpacity onPress={() => setIsSearchActive(true)} style={styles.iconBtn}>
              <AppIcon name="search" size={24} color="#0D523B" />
            </TouchableOpacity>
          }
        />
      )}

      <View style={styles.content}>


          {isLoading && !isRefreshing ? (
            <View style={{ marginTop: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} height={100} borderRadius={16} style={{ marginBottom: 12 }} />
              ))}
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              renderItem={renderCustomerItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[typography.bodyMedium, { color: '#94A3B8' }]}>
                    No customers found.
                  </Text>
                </View>
              }
            />
          )}
        </View>

      {/* Quick Collect Bottom Sheet Modal */}
      <Modal visible={!!selectedCustomer} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelectedCustomer(null)} />
            <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <View style={styles.sheetHeader}>
                <Text style={[typography.h3, { color: '#0F172A' }]}>Collect Payment</Text>
                <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                  <AppIcon name="x" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              {selectedCustomer && (
                <View style={styles.sheetContent}>
                  <Text style={[typography.bodyMedium, { color: '#64748B', marginBottom: 16 }]}>
                    Recording collection for <Text style={{ fontWeight: '700', color: '#0F172A' }}>{selectedCustomer.name}</Text>
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={[typography.caption, styles.label, { color: '#64748B' }]}>Amount</Text>
                    <View style={[styles.inputContainer, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                      <Text style={[typography.bodyLarge, { color: '#0F172A', marginRight: 8 }]}>₹</Text>
                      <TextInput
                        style={[styles.input, typography.bodyLarge, { color: '#0F172A' }]}
                        value={amount}
                        onChangeText={setAmount}
                        editable={false}
                        keyboardType="numeric"
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[typography.caption, styles.label, { color: '#64748B' }]}>Payment Method</Text>
                    <View style={styles.paymentMethodsRow}>
                      {(['Cash', 'UPI', 'Bank Transfer'] as const).map(mode => {
                        const isSelected = paymentMode === mode;
                        return (
                          <TouchableOpacity
                            key={mode}
                            style={[
                              styles.paymentMethodPill,
                              {
                                backgroundColor: isSelected ? '#DCFCE7' : '#F8FAFC',
                                borderColor: isSelected ? '#16A34A' : '#E2E8F0',
                              },
                            ]}
                            onPress={() => setPaymentMode(mode)}
                          >
                            <Text style={[typography.caption, { color: isSelected ? '#166534' : '#64748B', fontWeight: isSelected ? '700' : '500' }]}>
                              {mode}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[typography.caption, styles.label, { color: '#64748B' }]}>Remarks (Optional)</Text>
                    <View style={[styles.inputContainer, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                      <TextInput
                        style={[styles.input, typography.bodyMedium, { color: '#0F172A' }]}
                        value={remarks}
                        onChangeText={setRemarks}
                        placeholder="e.g. Paid in full"
                        placeholderTextColor="#94A3B8"
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  <CustomButton
                    title={isSubmitting ? 'Processing...' : 'Submit Collection'}
                    onPress={handleSubmitCollection}
                    disabled={isSubmitting}
                    variant="primary"
                    size="large"
                    style={{ marginTop: 12 }}
                  />
                </View>
              )}
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
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  customerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  collectBtn: {
    paddingHorizontal: 16,
    height: 30,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetContent: {},
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentMethodPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
});
