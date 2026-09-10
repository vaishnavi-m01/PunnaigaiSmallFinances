import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { WalletTransaction } from '../../types/models';

export const InvestorDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography } = useAppTheme();
  const investor = useAppSelector(state => state.investor);
  const user = useAppSelector(state => state.auth.user);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={user?.name || 'Ravi Chandran'}
        showBack={false}
        showNotification={true}
        showLogo={true}
      />

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
          <View style={styles.skeletonContent}>
            {/* Skeleton Hero Card */}
            <Skeleton
              height={180}
              borderRadius={24}
              style={styles.skeletonHero}
            />

            {/* Skeleton Terms Card */}
            <Skeleton
              height={160}
              borderRadius={16}
              style={styles.skeletonTerms}
            />

            {/* Skeleton Recent Returns List */}
            <Skeleton width={200} height={24} style={styles.skeletonHeading} />
            <Skeleton
              height={80}
              borderRadius={16}
              style={styles.skeletonTransaction}
            />
            <Skeleton
              height={80}
              borderRadius={16}
              style={styles.skeletonTransaction}
            />
          </View>
        ) : (
          <>
            {/* Investor Investment & Wallet Card */}
            <LinearGradient
              colors={[
                colors.heroGradient[0],
                colors.heroGradient[1],
                colors.heroGradient[2],
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Text style={[styles.heroSub, { color: colors.borderGreen }]}>
                Total Investment (Principal)
              </Text>
              <Text style={styles.heroMain}>
                {formatINR(investor.details.totalInvestment)}
              </Text>

              <View style={styles.divider} />

              <View style={styles.walletRow}>
                <View>
                  <Text
                    style={[styles.walletLabel, { color: colors.borderGreen }]}
                  >
                    Available Wallet Balance
                  </Text>
                  <Text style={styles.walletValue}>
                    {formatINR(investor.details.walletBalance)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.withdrawPill}
                  onPress={() => navigation.navigate(ROUTES.INVESTOR_WITHDRAW)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.withdrawText, { color: colors.primary }]}
                  >
                    Withdraw
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Investment Details Summary Card */}
            <Card style={styles.card} variant="elevated" padding={16}>
              <Text
                style={[
                  typography.h4,
                  styles.cardTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                Investment Terms & Agreement
              </Text>

              <View style={styles.termRow}>
                <Text
                  style={[
                    typography.bodyMedium,
                    styles.termLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Agreement Date
                </Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    styles.termValue,
                    { color: colors.textPrimary },
                  ]}
                >
                  {investor.details.agreementDate}
                </Text>
              </View>

              <View
                style={[
                  styles.termDivider,
                  { backgroundColor: colors.borderLight },
                ]}
              />

              <View style={styles.termRow}>
                <Text
                  style={[
                    typography.bodyMedium,
                    styles.termLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Monthly Return Payout
                </Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    styles.termValueStrong,
                    { color: colors.primary },
                  ]}
                >
                  + ₹ 10,000 / month (2%)
                </Text>
              </View>

              <View
                style={[
                  styles.termDivider,
                  { backgroundColor: colors.borderLight },
                ]}
              />

              <View style={styles.termRow}>
                <Text
                  style={[
                    typography.bodyMedium,
                    styles.termLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Total Returns Credited
                </Text>
                <Text
                  style={[
                    typography.bodyMedium,
                    styles.termValueStrong,
                    { color: colors.textPrimary },
                  ]}
                >
                  {formatINR(investor.details.totalPaymentsReceived)}
                </Text>
              </View>
            </Card>

            {/* Recent Monthly Returns */}
            <Text
              style={[
                typography.h3,
                styles.sectionTitle,
                { color: colors.textPrimary },
              ]}
            >
              Monthly Return Credits
            </Text>

            <View style={styles.txList}>
              {investor.transactions.map((tx: WalletTransaction) => (
                <Card
                  key={tx.id}
                  style={styles.txCard}
                  variant="elevated"
                  padding={14}
                >
                  <View style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <View
                        style={[
                          styles.iconCircle,
                          { backgroundColor: colors.primarySoft },
                        ]}
                      >
                        <AppIcon
                          name="trending-up"
                          size={18}
                          color={colors.primary}
                        />
                      </View>
                      <View>
                        <Text
                          style={[
                            typography.h4,
                            styles.transactionTitle,
                            {
                              color: colors.textPrimary,
                            },
                          ]}
                        >
                          {tx.title}
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            styles.transactionMeta,
                            { color: colors.textMuted },
                          ]}
                        >
                          {tx.date} • {tx.referenceNo}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        typography.h4,
                        styles.transactionAmount,
                        { color: colors.primary },
                      ]}
                    >
                      + {formatINR(tx.amount)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  skeletonContent: {
    paddingTop: 16,
  },
  skeletonHero: {
    marginBottom: 24,
  },
  skeletonTerms: {
    marginBottom: 32,
  },
  skeletonHeading: {
    marginBottom: 16,
  },
  skeletonTransaction: {
    marginBottom: 12,
  },
  heroCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroMain: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 16,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  walletValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  withdrawPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  withdrawText: {
    fontWeight: '800',
    fontSize: 12,
  },
  card: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
  },
  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  termDivider: {
    height: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '800',
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: '800',
  },
  termLabel: {
    fontWeight: '500',
  },
  termValue: {
    fontWeight: '700',
  },
  termValueStrong: {
    fontWeight: '800',
  },
  txList: {
    gap: 10,
  },
  txCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  transactionMeta: {
    marginTop: 2,
  },
  transactionAmount: {
    fontWeight: '800',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});
