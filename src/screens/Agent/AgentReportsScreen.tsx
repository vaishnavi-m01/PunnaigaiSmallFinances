import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { CollectionRecord } from '../../types/models';

export const AgentReportsScreen: React.FC = () => {
  const { colors, typography, radius } = useAppTheme();
  const agent = useAppSelector(state => state.agent);

  const [period, setPeriod] = useState<'TODAY' | 'MONTH'>('TODAY');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const totalCollectedToday = agent.todayCollection;
  const targetToday = 50000;
  const percentToday = targetToday > 0 ? Math.round((totalCollectedToday / targetToday) * 100) : 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Collection Reports" showBack={true} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={50} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={200} borderRadius={16} style={{ marginBottom: 24 }} />
            <Skeleton width={150} height={24} style={{ marginBottom: 16 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton height={80} borderRadius={16} style={{ marginBottom: 12 }} />
          </View>
        ) : (
          <>
            {/* Period Selector Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  {
                    borderColor: period === 'TODAY' ? colors.primary : colors.borderStrong,
                    backgroundColor: period === 'TODAY' ? colors.primary : colors.surface,
                    borderRadius: radius.md,
                  },
                ]}
                onPress={() => setPeriod('TODAY')}>
                <Text
                  style={[
                    typography.captionBold,
                    { color: period === 'TODAY' ? colors.white : colors.textSecondary },
                  ]}>
                  Today's Performance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  {
                    borderColor: period === 'MONTH' ? colors.primary : colors.borderStrong,
                    backgroundColor: period === 'MONTH' ? colors.primary : colors.surface,
                    borderRadius: radius.md,
                  },
                ]}
                onPress={() => setPeriod('MONTH')}>
                <Text
                  style={[
                    typography.captionBold,
                    { color: period === 'MONTH' ? colors.white : colors.textSecondary },
                  ]}>
                  Monthly Summary
                </Text>
              </TouchableOpacity>
            </View>

            {/* Performance Metric Card */}
            <Card
              style={[styles.metricCard, { backgroundColor: colors.primaryBackground, borderColor: colors.borderGreen }]}
              variant="elevated"
            >
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                {period === 'TODAY' ? "TODAY'S TARGET VS ACHIEVED" : 'THIS MONTH RECOVERY RATE'}
              </Text>

              <View style={styles.metricMainRow}>
                <Text style={[typography.statValue, { color: colors.primary, fontWeight: '800' }]}>
                  {formatINR(period === 'TODAY' ? totalCollectedToday : agent.totalCollection)}
                </Text>
                <View style={[styles.percentBadge, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    {percentToday}% Target
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressTrack, { backgroundColor: colors.primarySoft }]}>
                <View style={[styles.progressFill, { width: `${Math.min(100, percentToday)}%`, backgroundColor: colors.primary }]} />
              </View>

          <View style={styles.metricFooterRow}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Target: {formatINR(period === 'TODAY' ? targetToday : targetToday * 26)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Customers Assigned: {agent.assignedCustomers.length}
            </Text>
          </View>
        </Card>

        {/* Collection Entries List */}
        <Text style={[typography.h3, styles.sectionTitle, { color: colors.textPrimary }]}>
          Recent Collection Entries
        </Text>

        <View style={styles.list}>
          {agent.collections.map((col: CollectionRecord) => (
            <Card key={col.id} style={[styles.entryCard, { borderColor: colors.border }]} variant="elevated" padding={14}>
              <View style={styles.entryRow}>
                <View style={styles.entryLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
                    <AppIcon name="check" size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[typography.h4, { color: colors.textPrimary }]}>
                      {col.customerName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                      {col.receiptNumber} • {col.paymentMethod} • {col.date}
                    </Text>
                  </View>
                </View>
                <Text style={[typography.h4, { color: colors.primary, fontWeight: '800' }]}>
                  {formatINR(col.amount)}
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
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricCard: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  metricMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
  entryCard: {
    borderWidth: 1,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});
