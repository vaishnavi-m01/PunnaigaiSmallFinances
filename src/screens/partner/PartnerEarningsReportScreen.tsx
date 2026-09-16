import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { fetchPartnerContributionsThunk, addPartnerContributionThunk, fetchPartnerDashboardThunk } from '../../store/partnerSlice';
import { showToast } from '../../store/toastSlice';
import { CustomButton } from '../../component/Common/CustomButton';
import { CustomInput } from '../../component/Common/CustomInput';
import { Skeleton } from '../../component/Common/Skeleton';

export const PartnerEarningsReportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius } = useAppTheme();
  const partner = useAppSelector(state => state.partner);
  const dispatch = useAppDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer'>('Cash');
  const [notes, setNotes] = useState('Capital contribution');
  const [contributionDate, setContributionDate] = useState(() => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPartnerContributionsThunk());
    dispatch(fetchPartnerDashboardThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchPartnerContributionsThunk()),
      dispatch(fetchPartnerDashboardThunk())
    ]);
    setIsRefreshing(false);
  }, [dispatch]);

  const investmentHistory = (partner.contributions || []).map(c => ({
    id: String(c.id),
    title: c.notes || 'Capital Investment',
    date: new Date(c.contribution_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date(c.contribution_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    amount: Number(c.amount),
    status: c.status,
  }));

  const handleAddInvestment = () => {
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!numAmount || numAmount <= 0) {
      dispatch(showToast({ type: 'error', title: 'Invalid Amount', message: 'Enter a valid investment amount.' }));
      return;
    }

    setIsSubmitting(true);
    let backendDate = contributionDate;
    if (contributionDate.includes('-')) {
      const parts = contributionDate.split('-');
      if (parts.length === 3 && parts[2].length === 4) { // DD-MM-YYYY
        backendDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    dispatch(addPartnerContributionThunk({ 
      amount: numAmount, 
      payment_method: paymentMethod,
      contribution_date: backendDate,
      reference_number: "null",
      notes: notes || "Capital contribution"
    }))
      .unwrap()
      .then(() => {
        setIsSubmitting(false);
        setModalVisible(false);
        setAmount('');
        dispatch(showToast({ type: 'success', title: 'Success', message: 'Investment added successfully.' }));
        dispatch(fetchPartnerContributionsThunk());
        dispatch(fetchPartnerDashboardThunk());
      })
      .catch((err) => {
        setIsSubmitting(false);
        dispatch(showToast({ type: 'error', title: 'Error', message: err as string }));
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header title="My Investment" showBack={false} showNotification={true} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isRefreshing ? (
          <View>
            <Skeleton height={140} borderRadius={20} style={{ marginBottom: 24 }} />
            <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        ) : (
          <>
          {/* Active Investment Card */}
          <LinearGradient
            colors={['#047857', '#064E3B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 20 }]} pointerEvents="none">
              <View style={{ position: 'absolute', bottom: -40, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)' }} />
              <View style={{ position: 'absolute', top: -20, right: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />
            </View>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.smallIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <AppIcon name="briefcase" size={14} color="#FFFFFF" />
              </View>
              <Text style={[typography.subtitle, { color: '#FFFFFF', marginLeft: 8, opacity: 0.9 }]}>
                Total Capital Invested
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 }]} />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={[typography.h1, { color: '#FFFFFF', fontSize: 32, fontWeight: '800' }]}>
                {formatINR(partner.summary?.contributions || 0)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 }} />
                <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>
                  Active
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Investment Agreement Details */}
          <Text style={[typography.h3, { color: '#0F172A', marginBottom: 16, marginTop: 8 }]}>
            Agreement Details
          </Text>
          <View style={[styles.card, { backgroundColor: colors.white, borderColor: '#E2E8F0' }]}>
            <View style={[styles.dataRow, { borderBottomColor: '#F1F5F9' }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Profit Share Percentage</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {partner.profile?.profit_share_percentage || '0'}% of Net Profit
              </Text>
            </View>
            <View style={[styles.dataRow, { borderBottomColor: '#F1F5F9' }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Payout Frequency</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>Monthly (Wallet Credit)</Text>
            </View>
            <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Lock-in Period</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>36 Months</Text>
            </View>
          </View>

          {/* Investment History Log */}
          <Text style={[typography.h3, { color: '#0F172A', marginBottom: 16, marginTop: 8 }]}>
            Investment History
          </Text>
          {investmentHistory.map((item) => (
            <View key={item.id} style={[styles.historyCard, { backgroundColor: colors.white, borderColor: '#E2E8F0' }]}>
              <View style={styles.historyLeft}>
                <View style={[styles.historyIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <AppIcon name="download" size={18} color="#16A34A" />
                </View>
                <View>
                  <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                    {item.title}
                  </Text>
                  <Text style={[typography.caption, { color: '#64748B', marginTop: 2 }]}>
                    {item.date} • {item.time}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.subtitle, { color: '#10B981', fontWeight: '700' }]}>
                  +{formatINR(item.amount)}
                </Text>
                <Text style={[typography.caption, { color: '#64748B', marginTop: 2, fontWeight: '600', textTransform: 'capitalize' }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          ))}
          {investmentHistory.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#94A3B8' }}>No investments found.</Text>
          )}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: '#0D523B' }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <AppIcon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Sheet Modal for Add Investment */}
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
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>Add Investment</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <AppIcon name="x" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[typography.bodyMedium, styles.label]}>Investment Amount</Text>
                  <View style={[styles.inputBox, { borderColor: colors.border }]}>
                    <Text style={[styles.currencyPrefix, { color: colors.textPrimary }]}>₹</Text>
                    <TextInput
                      style={[styles.numericInput, { color: colors.textPrimary }]}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      placeholder="10000"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[typography.bodyMedium, styles.label]}>Payment Method</Text>
                  <View style={styles.paymentMethodsRow}>
                    {(['Cash', 'Bank Transfer'] as const).map(mode => {
                      const isSelected = paymentMethod === mode;
                      return (
                        <TouchableOpacity
                          key={mode}
                          style={[
                            styles.paymentMethodPill,
                            { borderColor: isSelected ? '#10B981' : colors.border, backgroundColor: isSelected ? '#ECFDF5' : colors.white }
                          ]}
                          onPress={() => setPaymentMethod(mode)}
                        >
                          <Text style={[typography.bodyMedium, { color: isSelected ? '#047857' : '#64748B', fontWeight: isSelected ? '700' : '500' }]}>
                            {mode}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <CustomInput
                  label="Contribution Date (DD-MM-YYYY)"
                  value={contributionDate}
                  onChangeText={setContributionDate}
                  placeholder="16-09-2026"
                  leftIcon="calendar"
                />
                
                <View style={{ marginTop: -8 }}>
                  <CustomInput
                    label="Notes (Optional)"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Capital contribution"
                    leftIcon="file-text"
                  />
                </View>

                <CustomButton
                  title={isSubmitting ? 'Processing...' : 'Submit Investment'}
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
});
