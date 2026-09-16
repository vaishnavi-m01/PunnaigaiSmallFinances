import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Header } from '../../component/Header';
import { useAppDispatch } from '../../hooks/useAppHooks';
import { fetchDashboardThunk } from '../../store/customerSlice';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';

/**
 * Screen 10: Penalty Details Screen
 * Total Penalty hero card, Penalty Information specs card, and green "No penalty applied" status banner.
 * Flat, zero shadows.
 */
export const PenaltyDetailsScreen: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dispatch = useAppDispatch();
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchDashboardThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Penalty Details" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0D523B" />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={300} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={60} borderRadius={16} />
          </View>
        ) : (
          <>
            {/* Total Penalty Hero Card */}
            <Card style={styles.penaltyHeaderCard} variant="flat" padding={18}>
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.penaltyLabel}>
                    Total Penalty
                  </Text>
                  <Text style={styles.penaltyAmount}>
                    ₹ 2,000
                  </Text>
                </View>
                <View style={styles.iconCircle}>
                  <AppIcon name="user" size={22} color="#EF4444" />
                </View>
              </View>
            </Card>

            {/* Penalty Configuration Information Card */}
            <Card style={styles.infoCard} variant="flat" padding={16}>
              <Text style={styles.infoTitle}>
                Penalty Information
              </Text>

              <View style={styles.configRow}>
                <Text style={styles.configLabel}>
                  Penalty Enabled
                </Text>
                <Text style={styles.configValue}>
                  Yes
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.configRow}>
                <Text style={styles.configLabel}>
                  Penalty Type
                </Text>
                <Text style={styles.configValue}>
                  Fixed Amount
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.configRow}>
                <Text style={styles.configLabel}>
                  Penalty Amount
                </Text>
                <Text style={styles.configValue}>
                  ₹ 1,000
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.configRow}>
                <Text style={styles.configLabel}>
                  Penalty Frequency
                </Text>
                <Text style={styles.configValue}>
                  Monthly
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.configRow}>
                <Text style={styles.configLabel}>
                  Grace Period
                </Text>
                <Text style={styles.configValue}>
                  3 Days
                </Text>
              </View>
            </Card>

            {/* No Penalty Applied Status Box */}
            <View style={styles.statusBox}>
              <View style={styles.statusHeaderRow}>
                <AppIcon name="check-circle" size={16} color="#0D523B" style={styles.statusIcon} />
                <Text style={styles.statusTitle}>
                  No penalty applied
                </Text>
              </View>
              <Text style={styles.statusSub}>
                You are currently not eligible for any penalty.
              </Text>
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
    backgroundColor: '#F4F9F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  penaltyHeaderCard: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  penaltyLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  penaltyAmount: {
    marginTop: 4,
    fontWeight: '900',
    fontSize: 24,
    color: '#EF4444',
    letterSpacing: -0.5,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  configLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  configValue: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  statusBox: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusTitle: {
    color: '#0D523B',
    fontSize: 13,
    fontWeight: '800',
  },
  statusSub: {
    color: '#15803D',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
    marginLeft: 22,
  },
});
