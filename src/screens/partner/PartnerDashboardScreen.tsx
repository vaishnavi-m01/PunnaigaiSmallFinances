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
import { PartnerEarningsItem } from '../../types/models';

export const PartnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={user?.name || 'Arun & Kumar'}
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
          <View style={{ paddingTop: 16 }}>
            {/* Skeleton Hero Card */}
            <Skeleton
              height={200}
              borderRadius={24}
              style={{ marginBottom: 24 }}
            />

            {/* Skeleton Wallet Banner */}
            <Skeleton
              height={70}
              borderRadius={16}
              style={{ marginBottom: 32 }}
            />

            {/* Skeleton Earnings History List */}
            <Skeleton width={200} height={24} style={{ marginBottom: 16 }} />
            <Skeleton
              height={80}
              borderRadius={16}
              style={{ marginBottom: 12 }}
            />
            <Skeleton
              height={80}
              borderRadius={16}
              style={{ marginBottom: 12 }}
            />
            <Skeleton
              height={80}
              borderRadius={16}
              style={{ marginBottom: 12 }}
            />
          </View>
        ) : (
          <>
            {/* Partner Hero Contribution & Wallet Card */}
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
                Partner Capital Contribution
              </Text>
              <Text style={styles.heroMain}>
                {formatINR(partner.details.totalContribution)}
              </Text>

              <View style={styles.divider} />

              <View style={styles.metricsRow}>
                <View>
                  <Text
                    style={[styles.metricLabel, { color: colors.borderGreen }]}
                  >
                    Total Profit Earnings
                  </Text>
                  <Text style={styles.metricValue}>
                    {formatINR(partner.details.totalEarnings)}
                  </Text>
                </View>

                <View style={styles.verticalDivider} />

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: colors.borderGreen },
                      ]}
                    >
                      Wallet Balance
                    </Text>
                    <Text style={styles.metricValue}>
                      {formatINR(partner.details.walletBalance)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.withdrawPill}
                    onPress={() => navigation.navigate(ROUTES.PARTNER_WITHDRAW)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.withdrawText, { color: colors.primary }]}
                    >
                      Withdraw
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            {/* Action Button to Wallet */}
            <TouchableOpacity
              style={[
                styles.walletBanner,
                {
                  backgroundColor: colors.primaryBackground,
                  borderColor: colors.borderGreen,
                },
              ]}
              onPress={() => navigation.navigate(ROUTES.PARTNER_WALLET)}
              activeOpacity={0.8}
            >
              <View style={styles.bannerLeft}>
                <AppIcon name="wallet" size={24} color={colors.primary} />
                <View style={{ marginLeft: 12 }}>
                  <Text
                    style={[
                      typography.h4,
                      { color: colors.primary, fontWeight: '700' },
                    ]}
                  >
                    Partner Wallet
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.primaryLight, marginTop: 2 },
                    ]}
                  >
                    Balance available for withdrawal:{' '}
                    {formatINR(partner.details.walletBalance)}
                  </Text>
                </View>
              </View>
              <AppIcon name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>

            {/* Monthly Earnings Breakdown */}
            <Text
              style={[
                typography.h3,
                styles.sectionTitle,
                { color: colors.textPrimary, fontWeight: '800' },
              ]}
            >
              Monthly Earnings History
            </Text>

            <View style={styles.earningsList}>
              {partner.earnings.map((e: PartnerEarningsItem, idx: number) => (
                <Card
                  key={idx}
                  style={styles.card}
                  variant="elevated"
                  padding={14}
                >
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
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
                            {
                              color: colors.textPrimary,
                              fontWeight: '700',
                              fontSize: 14,
                            },
                          ]}
                        >
                          {e.month}
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            { color: colors.textMuted, marginTop: 2 },
                          ]}
                        >
                          Credited on {e.date}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        typography.h4,
                        { color: colors.primary, fontWeight: '800' },
                      ]}
                    >
                      + {formatINR(e.amount)}
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
  heroCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },
  heroSub: {
    color: '#B8D5D5',
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#B8D5D5',
    fontSize: 11,
    fontWeight: '500',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  walletBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#B8D5D5',
    backgroundColor: '#F0F7F7',
    borderRadius: 16,
    marginBottom: 24,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  earningsList: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  withdrawPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  withdrawText: {
    color: '#0D523B',
    fontSize: 12,
    fontWeight: '800',
  },
});
