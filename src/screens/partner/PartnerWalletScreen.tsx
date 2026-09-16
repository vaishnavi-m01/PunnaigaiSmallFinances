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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { fetchPartnerWithdrawalsThunk, fetchPartnerDashboardThunk } from '../../store/partnerSlice';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { PartnerTransaction } from '../../types/models';

type DateFilter = 'All' | 'Today' | 'Week' | 'Month' | 'Year';
type DirectionFilter = 'All' | 'credit' | 'debit';

export const PartnerWalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const dispatch = useAppDispatch();
  const partner = useAppSelector(state => state.partner);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('All');
  
  const [showDateModal, setShowDateModal] = useState(false);
  const [showDirModal, setShowDirModal] = useState(false);

  const fetchTransactions = useCallback(() => {
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

    const direction = directionFilter === 'All' ? undefined : directionFilter;

    console.log("Filtering transactions with params:", { from_date, to_date, direction });

    return dispatch(fetchPartnerWithdrawalsThunk({ from_date, to_date, direction }));
  }, [dateFilter, directionFilter, dispatch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchTransactions(),
      dispatch(fetchPartnerDashboardThunk())
    ]);
    setIsRefreshing(false);
  }, [fetchTransactions, dispatch]);

  // Merge credits and debits into a single list and sort by date descending
  const combinedTransactions = [
    ...(partner.credits || []).map(t => ({ ...t, direction: 'in' })),
    ...(partner.debits || []).map(t => ({ ...t, direction: 'out' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const transactions = combinedTransactions.map((t: any) => ({
    id: `tx_${t.id}_${t.type}_${t.direction}`,
    title: t.reference || t.notes || t.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    subtitle: t.type === 'contribution' ? 'Capital Contribution' : t.type === 'profit' ? 'Profit Share' : 'Withdrawal',
    amount: Number(t.amount),
    date: new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    type: t.direction === 'in' ? 'credit' : 'debit',
    icon: t.direction === 'in' ? 'arrow-down-circle' : 'arrow-up-circle',
    iconColor: t.direction === 'in' ? '#10B981' : '#EF4444',
    iconBg: t.direction === 'in' ? '#D1FAE5' : '#FEE2E2',
  }));

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title="Wallet" 
        showBack={false} 
        rightComponent={
          <TouchableOpacity 
            style={[styles.dropdownBtn, { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, minWidth: 100, justifyContent: 'space-between', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' }]}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={[styles.dropdownBtnText, { flex: 1, textAlign: 'center' }]}>{dateFilter === 'All' ? 'All Time' : dateFilter}</Text>
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
          {/* Balance Card */}
          <LinearGradient
            colors={['#047857', '#064E3B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.balanceCard, { borderWidth: 0 }]}
          >
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 20 }]} pointerEvents="none">
              <View style={{ position: 'absolute', bottom: -40, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)' }} />
              <View style={{ position: 'absolute', top: -20, right: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />
            </View>

            <View style={styles.balanceTopRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <AppIcon name="pocket" size={20} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 16 }}>
                <Text style={[typography.bodyMedium, { color: '#FFFFFF', opacity: 0.9 }]}>
                  Available Profit Balance
                </Text>
                <Text style={[typography.h2, { color: '#FFFFFF', marginTop: 4 }]}>
                  {formatINR(partner.summary.available_balance || 0)}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.withdrawBtn, { backgroundColor: '#FFFFFF', marginTop: 12, flexDirection: 'row', justifyContent: 'center' }]}
              onPress={() => navigation.navigate(ROUTES.PARTNER_WITHDRAW)}
              activeOpacity={0.8}
            >
              <Text style={[typography.subtitle, { color: '#047857', fontWeight: 'bold' }]}>Withdraw Profit</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Transaction History Header */}
          <View style={styles.historyHeader}>
            <Text style={[typography.h3, { color: '#0F172A' }]}>
              Transaction History
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
                  {type === 'All' ? 'All' : type === 'credit' ? 'Credit (+)' : 'Debit (-)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Transaction List */}
          <View style={styles.txList}>
            {transactions.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>No transactions found.</Text>
              </View>
            ) : (
            transactions.map((tx: any) => (
              <View key={tx.id} style={[styles.txCard, { backgroundColor: colors.white }]}>
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
            ))
            )}
          </View>
          </>
          )}
        </ScrollView>
      </View>

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
});
