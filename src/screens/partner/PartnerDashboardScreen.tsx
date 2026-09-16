import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { fetchPartnerDashboardThunk } from '../../store/partnerSlice';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';

const PartnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const dispatch = useAppDispatch();
  const partner = useAppSelector(state => state.partner);
  const user = useAppSelector(state => state.auth.user);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPartnerDashboardThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchPartnerDashboardThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const recentTransactions = [
    ...(partner.contributions || []).map(c => ({
      id: `c_${c.id}`,
      title: 'Investment Added',
      amount: Number(c.amount),
      date: new Date(c.contribution_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: 'credit',
      icon: 'triangle',
      iconColor: '#10B981',
      iconBg: '#D1FAE5',
    })),
    ...(partner.earnings || []).map(e => ({
      id: `e_${e.id}`,
      title: 'Profit Share',
      amount: Number(e.share_amount),
      date: new Date(e.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: 'credit',
      icon: 'briefcase',
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <View
        style={[styles.topHeader, { paddingTop: Math.max(insets.top + 6, 16) }]}
      >
        <View style={styles.headerLeft}>
          {/* User Avatar Circle */}
          <TouchableOpacity
            style={styles.avatarCircleHeader}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.PARTNER_PROFILE)}
          >
            <View style={styles.avatarInner}>
              <AppIcon name="user" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Greeting Text */}
          <View style={styles.nameBlock}>
            <Text style={styles.greetingTitle}>
              Hello, {user?.name?.split(' ')[0] || 'Kavin'}
            </Text>
            <Text style={styles.greetingSubtitle}>
              Welcome back to your partnership!
            </Text>
          </View>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <AppIcon name="bell" size={20} color="#0F172A" />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

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

              {/* My Investment Card */}
              <LinearGradient
                colors={['#047857', '#064E3B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.investmentCard}
              >
                <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 20 }]} pointerEvents="none">
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
                  {formatINR(partner.summary.contributions || 0)}
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
                    {formatINR(partner.summary.earnings || 0)}
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
                    {formatINR(partner.summary.available_balance || 0)}
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
  );
};
export { PartnerDashboardScreen };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircleHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D523B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D523B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameBlock: {
    justifyContent: 'center',
  },
  greetingTitle: {
    color: '#0F172A',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  greetingSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  investmentCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
