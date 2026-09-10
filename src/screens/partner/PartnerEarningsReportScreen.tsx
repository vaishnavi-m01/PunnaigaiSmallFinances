import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';

export const PartnerEarningsReportScreen: React.FC = () => {
  const { colors, typography, radius } = useAppTheme();
  const partner = useAppSelector(state => state.partner);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="P&L & Earnings Breakdown" showBack={false} showNotification={true} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={100} borderRadius={16} style={{ marginBottom: 24 }} />
            <Skeleton height={30} width={200} style={{ marginBottom: 16 }} />
            <Skeleton height={250} borderRadius={16} style={{ marginBottom: 24 }} />
            <Skeleton height={30} width={200} style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Skeleton height={80} borderRadius={16} style={{ flex: 1 }} />
              <Skeleton height={80} borderRadius={16} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <>
            {/* Profit Share Formula Banner */}
            <Card style={[styles.formulaCard, { backgroundColor: colors.primaryBackground, borderColor: colors.borderGreen }]} variant="flat">
              <View style={styles.formulaHeader}>
                <AppIcon name="star" size={22} color={colors.primary} />
                <Text style={[typography.h4, { color: colors.primary, marginLeft: 8, fontWeight: '700' }]}>
                  Profit Sharing Agreement (25% Share)
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.primaryLight, marginTop: 6, lineHeight: 18 }]}>
                Net Profit = Gross Interest Collections - Operating & Field Expenses - Capital Reserves.
                Partner receives 25% of Net Profit credited monthly into the Partner Wallet.
              </Text>
            </Card>

            {/* Financial Highlights */}
            <Text style={[typography.h3, styles.sectionTitle, { color: colors.textPrimary }]}>
              Current Quarter Financials
            </Text>

            <Card style={[styles.card, { borderColor: colors.border }]} variant="flat">
              <View style={styles.row}>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Gross Revenue (Interest & Penalties)</Text>
                <Text style={[typography.bodyBold, { color: colors.primary }]}>{formatINR(220000)}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.row}>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Operating & Field Expenses</Text>
                <Text style={[typography.bodyBold, { color: colors.errorText }]}>- {formatINR(40000)}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.row}>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Investor Returns Distributed (2%)</Text>
                <Text style={[typography.bodyBold, { color: colors.errorText }]}>- {formatINR(30000)}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.row}>
                <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: '700' }]}>Net Distributable Profit</Text>
                <Text style={[typography.h4, { color: colors.primary, fontWeight: '800' }]}>{formatINR(150000)}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

              <View style={[styles.row, { backgroundColor: colors.primarySoft, marginHorizontal: -16, marginBottom: -16, padding: 14, borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md }]}>
                <Text style={[typography.bodyBold, { color: colors.primary }]}>Your 25% Partner Share</Text>
                <Text style={[typography.h3, { color: colors.primary, fontWeight: '800' }]}>{formatINR(37500)}</Text>
              </View>
            </Card>

            {/* Lifetime Partner Stats */}
            <Text style={[typography.h3, styles.sectionTitle, { color: colors.textPrimary }]}>
              Partner Account Summary
            </Text>

            <View style={styles.summaryGrid}>
              <Card style={[styles.gridCard, { borderColor: colors.border }]} variant="flat" padding={14}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Capital Invested</Text>
                <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: '700', marginTop: 4 }]}>
                  {formatINR(partner.details.totalContribution)}
                </Text>
              </Card>

              <Card style={[styles.gridCard, { borderColor: colors.border }]} variant="flat" padding={14}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Lifetime Earnings</Text>
                <Text style={[typography.h4, { color: colors.primary, fontWeight: '700', marginTop: 4 }]}>
                  {formatINR(partner.details.totalEarnings)}
                </Text>
              </Card>
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
  formulaCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    borderWidth: 1,
  },
});
