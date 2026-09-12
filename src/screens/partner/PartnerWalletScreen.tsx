import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';

export const PartnerWalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const partner = useAppSelector(state => state.partner);

  const transactions = [
    {
      id: '1',
      title: 'Investment Added',
      subtitle: 'Initial investment by Kavin',
      amount: partner.details.totalContribution,
      date: '11 Sep 2026',
      type: 'credit',
      icon: 'triangle',
      iconColor: '#10B981',
      iconBg: '#D1FAE5',
    },
    {
      id: '2',
      title: 'Profit Share',
      subtitle: 'Share from partnership profit',
      amount: partner.details.totalEarnings,
      date: '11 Sep 2026',
      type: 'credit',
      icon: 'briefcase',
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
    },
    {
      id: '3',
      title: 'Profit Withdrawal',
      subtitle: 'Withdraw profit amount',
      amount: 2000,
      date: '15 Sep 2026',
      type: 'debit',
      icon: 'file-text',
      iconColor: '#EF4444',
      iconBg: '#FEE2E2',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#168B5E' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Area */}
      <LinearGradient
        colors={['#0B533E', '#168B5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}
      >
        <View style={styles.headerTitleRow}>
          <Text style={[typography.h3, { color: colors.white }]}>
            Wallet
          </Text>
        </View>
      </LinearGradient>

      {/* Full Page White Container */}
      <View style={styles.pageContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Card */}
          <View style={[styles.balanceCard, { backgroundColor: colors.white }]}>
            <View style={styles.balanceTopRow}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <AppIcon name="pocket" size={20} color="#10B981" />
              </View>
              <View style={{ marginLeft: 16 }}>
                <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                  Available Profit Balance
                </Text>
                <Text style={[typography.h2, { color: '#0F172A', marginTop: 4 }]}>
                  {formatINR(partner.details.walletBalance)}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.withdrawBtn, { backgroundColor: '#0D523B' }]}
              onPress={() => navigation.navigate(ROUTES.PARTNER_WITHDRAW)}
              activeOpacity={0.8}
            >
              <Text style={[typography.subtitle, { color: colors.white }]}>Withdraw Profit</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction History Header */}
          <View style={styles.historyHeader}>
            <Text style={[typography.h3, { color: '#0F172A' }]}>
              Transaction History
            </Text>
            <TouchableOpacity>
              <AppIcon name="filter" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>

          {/* Transaction List */}
          <View style={styles.txList}>
            {transactions.map(tx => (
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
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawBtn: {
    paddingVertical: 16,
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
});
