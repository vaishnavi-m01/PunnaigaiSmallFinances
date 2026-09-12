import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';

export const PartnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const partner = useAppSelector(state => state.partner);
  const user = useAppSelector(state => state.auth.user);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  const recentTransactions = [
    {
      id: '1',
      title: 'Investment Added',
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
      amount: partner.details.totalEarnings,
      date: '11 Sep 2026',
      type: 'credit',
      icon: 'briefcase',
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#168B5E' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Area */}
      <LinearGradient
        colors={['#0B533E', '#168B5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 16 }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={{ width: 32, height: 32, resizeMode: 'contain', tintColor: '#FFFFFF' }} 
            />
            <Text style={[typography.h3, { color: colors.white, marginLeft: 8 }]}>
              Punnaigai{'\n'}Small Finances
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notifBadge}
            onPress={() => {}}
          >
            <AppIcon name="bell" size={24} color={colors.white} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Full Page White Container */}
      <View style={styles.pageContainer}>
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
          {isRefreshing ? (
            <View style={{ paddingTop: 16 }}>
              <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />
              <Skeleton height={120} borderRadius={16} style={{ marginBottom: 16 }} />
            </View>
          ) : (
            <>
              {/* Greeting Section */}
              <View style={styles.greetingSection}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h3, { color: '#0F172A' }]}>
                    Hello, {user?.name?.split(' ')[0] || 'Kavin'} 👋
                  </Text>
                  <Text style={[typography.bodyMedium, { color: '#64748B', marginTop: 4 }]}>
                    Welcome back to your partnership
                  </Text>
                </View>
                <View style={styles.leafPlaceholder}>
                   <AppIcon name="feather" size={40} color="#D1FAE5" />
                   <View style={{ position: 'absolute', top: -10, right: 15, transform: [{ rotate: '45deg' }] }}>
                     <AppIcon name="feather" size={24} color="#A7F3D0" />
                   </View>
                </View>
              </View>

              {/* My Investment Card */}
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.investmentCard}
              >
                <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden', borderRadius: 20 }]} pointerEvents="none">
                  <View style={{ position: 'absolute', bottom: -40, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <View style={{ position: 'absolute', top: -20, right: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                </View>
                <View style={styles.investmentTop}>
                  <View style={[styles.investIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <AppIcon name="briefcase" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={[typography.subtitle, { color: colors.white, marginLeft: 12, opacity: 0.9 }]}>
                    My Investment
                  </Text>
                </View>
                <Text style={[typography.h1, { color: colors.white, marginTop: 16, fontSize: 36, fontWeight: 'bold' }]}>
                  {formatINR(partner.details.totalContribution)}
                </Text>
              </LinearGradient>

              {/* Profit & Wallet Row */}
              <View style={styles.splitRow}>
                {/* My Profit */}
                <View style={[styles.splitCard, { backgroundColor: '#FFF5F5' }]}>
                  <View style={styles.splitIconRow}>
                    <View style={[styles.smallIconCircle, { backgroundColor: '#FEE2E2' }]}>
                      <AppIcon name="pie-chart" size={14} color="#EF4444" />
                    </View>
                    <Text style={[typography.subtitle, { color: '#475569', marginLeft: 8 }]}>
                      My Profit
                    </Text>
                  </View>
                  <Text style={[typography.h3, { color: '#0F172A', marginTop: 12 }]}>
                    {formatINR(partner.details.totalEarnings)}
                  </Text>
                </View>

                {/* My Wallet */}
                <View style={[styles.splitCard, { backgroundColor: '#F5F3FF' }]}>
                  <View style={styles.splitIconRow}>
                    <View style={[styles.smallIconCircle, { backgroundColor: '#EDE9FE' }]}>
                      <AppIcon name="credit-card" size={14} color="#8B5CF6" />
                    </View>
                    <Text style={[typography.subtitle, { color: '#475569', marginLeft: 8 }]}>
                      My Wallet
                    </Text>
                  </View>
                  <Text style={[typography.h3, { color: '#0F172A', marginTop: 12 }]}>
                    {formatINR(partner.details.walletBalance)}
                  </Text>
                </View>
              </View>

              {/* Quick Access */}
              <Text style={[typography.h3, styles.sectionTitle, { color: '#0F172A' }]}>
                Quick Access
              </Text>
              
              <View style={styles.quickAccessGrid}>
                <TouchableOpacity 
                  style={styles.quickAccessItem}
                  onPress={() => navigation.navigate(ROUTES.MY_EARNINGS)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <AppIcon name="trending-up" size={24} color="#10B981" />
                  </View>
                  <Text style={[typography.caption, { color: '#64748B' }]}>
                    Investment
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessItem}
                  onPress={() => navigation.navigate(ROUTES.MY_EARNINGS)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <AppIcon name="pie-chart" size={24} color="#F43F5E" />
                  </View>
                  <Text style={[typography.caption, { color: '#64748B' }]}>
                    Profit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessItem}
                  onPress={() => navigation.navigate(ROUTES.PARTNER_WALLET)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickIconBox, { backgroundColor: '#EEF2FF' }]}>
                    <AppIcon name="credit-card" size={24} color="#6366F1" />
                  </View>
                  <Text style={[typography.caption, { color: '#64748B' }]}>
                    Wallet
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickAccessItem}
                  onPress={() => navigation.navigate(ROUTES.PARTNER_WALLET)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickIconBox, { backgroundColor: '#F0FDF4' }]}>
                    <AppIcon name="file-text" size={24} color="#22C55E" />
                  </View>
                  <Text style={[typography.caption, { color: '#64748B' }]}>
                    Transactions
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Recent Transactions */}
              <View style={styles.historyHeader}>
                <Text style={[typography.h3, { color: '#0F172A' }]}>
                  Recent Transactions
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.PARTNER_WALLET)}>
                  <Text style={[typography.subtitle, { color: '#16A34A' }]}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.txList}>
                {recentTransactions.map(tx => (
                  <View key={tx.id} style={styles.txCard}>
                    <View style={styles.txLeft}>
                      <View style={[styles.txIconBox, { backgroundColor: tx.iconBg }]}>
                        <AppIcon name={tx.icon} size={16} color={tx.iconColor} />
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[typography.subtitle, { color: '#0F172A' }]} numberOfLines={1}>
                          {tx.title}
                        </Text>
                        <Text style={[typography.caption, { color: '#64748B', marginTop: 2 }]} numberOfLines={1}>
                          {tx.date}
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
                    </View>
                  </View>
                ))}
              </View>

            </>
          )}
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'relative',
    padding: 4,
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#0B533E',
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  leafPlaceholder: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  investmentCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  investmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  investIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  splitCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
  },
  splitIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: '23%',
    alignItems: 'center',
  },
  quickIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
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
    backgroundColor: '#FFFFFF',
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
