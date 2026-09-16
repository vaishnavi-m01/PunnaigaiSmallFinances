import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../component/Header';
import { useAppDispatch } from '../../hooks/useAppHooks';
import { fetchDashboardThunk } from '../../store/customerSlice';
import { Card } from '../../component/Common/Card';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { ROUTES } from '../../constants/routes';
import { BotanicalLeaves } from '../../component/Common/BotanicalArt';

/**
 * Screen 9: Overdue Details Screen
 * Total Overdue Amount banner, breakdown items with icons (EMI Pending, Late Fee, Other Charges),
 * outline "View Details" button, and blue informational notice banner. Zero shadows.
 */
export const OverdueDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

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
      <Header title="Overdue Details" showBack={true} />

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
            <Skeleton height={250} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={80} borderRadius={16} />
          </View>
        ) : (
          <>
            {/* Total Overdue Banner Card */}
            <Card style={styles.bannerCard} variant="flat" padding={18}>
              <BotanicalLeaves
                width={100}
                height={70}
                opacity={0.08}
                color="#EF4444"
                style={styles.bannerLeaves}
              />
              <Text style={styles.bannerLabel}>
                Total Overdue Amount
              </Text>
              <Text style={styles.overdueAmount}>
                ₹ 12,000
              </Text>
            </Card>

            {/* Breakdown Card */}
            <Card style={styles.breakdownCard} variant="flat" padding={14}>
              {/* Item 1: EMI Pending */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <AppIcon name="alert-triangle" size={16} color="#D97706" />
                  </View>
                  <Text style={styles.rowTitle}>
                    EMI Pending
                  </Text>
                </View>
                <Text style={styles.rowValue}>
                  ₹ 9,000
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Item 2: Late Fee */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#EAF5EE' }]}>
                    <AppIcon name="check-circle" size={16} color="#0D523B" />
                  </View>
                  <Text style={styles.rowTitle}>
                    Late Fee
                  </Text>
                </View>
                <Text style={styles.rowValue}>
                  ₹ 1,000
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Item 3: Other Charges */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#EAF5EE' }]}>
                    <AppIcon name="shield" size={16} color="#0D523B" />
                  </View>
                  <Text style={styles.rowTitle}>
                    Other Charges
                  </Text>
                </View>
                <Text style={styles.rowValue}>
                  ₹ 2,000
                </Text>
              </View>

              {/* View Details Outline Button */}
              <TouchableOpacity
                style={styles.viewDetailsOutlineBtn}
                onPress={() => navigation.navigate(ROUTES.PENALTY_DETAILS)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewDetailsOutlineText}>
                  View Details
                </Text>
              </TouchableOpacity>
            </Card>

            {/* Info Notice Card */}
            <Card style={styles.infoCard} variant="flat" padding={12}>
              <View style={styles.infoRow}>
                <AppIcon name="info" size={18} color="#0284C7" />
                <Text style={styles.infoText}>
                  Please clear your dues immediately to avoid further penalty charges.
                </Text>
              </View>
            </Card>
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
  bannerCard: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerLeaves: {
    right: -10,
    top: 10,
  },
  bannerLabel: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  overdueAmount: {
    marginTop: 4,
    fontWeight: '900',
    fontSize: 26,
    color: '#EF4444',
    letterSpacing: -0.5,
  },
  breakdownCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rowTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  rowValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  viewDetailsOutlineBtn: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#0D523B',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsOutlineText: {
    color: '#0D523B',
    fontWeight: '800',
    fontSize: 12,
  },
  warningBox: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningNoteText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
    color: '#0369A1',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    color: '#0369A1',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    fontWeight: '600',
  },
});
