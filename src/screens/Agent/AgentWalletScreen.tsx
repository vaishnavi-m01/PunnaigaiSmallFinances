import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppIcon } from '../../component/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import { formatINR } from '../../utils/currency';
import { Header } from '../../component/Header';

type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  date: string;
  amount: number;
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'credit', title: 'Commission Received', date: '12 Sep 2026', amount: 5000 },
  { id: '2', type: 'debit', title: 'Withdrawal to Bank', date: '10 Sep 2026', amount: 10000 },
  { id: '3', type: 'credit', title: 'Commission Received', date: '05 Sep 2026', amount: 3000 },
  { id: '4', type: 'credit', title: 'Incentive', date: '01 Sep 2026', amount: 2000 },
];


export const AgentWalletScreen: React.FC = () => {
  const { colors, typography } = useAppTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredTransactions = MOCK_TRANSACTIONS.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === 'credit';
    return (
      <View style={[styles.transactionCard, { backgroundColor: colors.white }]}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' },
            ]}
          >
            <AppIcon name={isCredit ? 'arrow-down-left' : 'arrow-up-right'} size={18} color={isCredit ? '#16A34A' : '#EF4444'} />
          </View>
          <View>
            <Text style={[typography.bodyLarge, styles.txTitle, { color: '#0F172A' }]}>
              {item.title}
            </Text>
            <Text style={[typography.caption, { color: '#64748B' }]}>
              {item.date}
            </Text>
          </View>
        </View>
        <Text
          style={[
            typography.bodyLarge,
            styles.txAmount,
            { color: isCredit ? '#16A34A' : '#EF4444' },
          ]}
        >
          {isCredit ? '+' : '-'}{formatINR(item.amount)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header title="Wallet" showBack={true} />
        <View style={styles.content}>
          <View style={[styles.balanceCard, { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]}>
            <Text style={[typography.bodyLarge, { color: '#0B533E' }]}>Available Balance</Text>
            <Text style={[typography.h1, { color: '#064E3B', marginVertical: 8 }]}>{formatINR(250000)}</Text>
            
            <TouchableOpacity style={[styles.withdrawBtn, { backgroundColor: '#16A34A' }]}>
              <Text style={[typography.bodyLarge, { color: colors.white, fontWeight: '700' }]}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.white }]}>
            <AppIcon name="search" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Search transactions..."
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, typography.bodyMedium, { color: '#0F172A' }]}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={[typography.h4, styles.sectionTitle, { color: '#0F172A' }]}>
            Recent Transactions
          </Text>

          <FlatList
            data={filteredTransactions}
            keyExtractor={item => item.id}
            renderItem={renderTransaction}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  withdrawBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 26,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    height: '100%',
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  txAmount: {
    fontWeight: '800',
  },
});
