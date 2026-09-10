import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { CollectionRecord } from '../../types/models';

export const AgentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useAppTheme();
  const agent = useAppSelector(state => state.agent);
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
      <Header
        title={user?.name || 'Karthik'}
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
            {/* Skeleton Metrics Card */}
            <Skeleton
              height={180}
              borderRadius={24}
              style={{ marginBottom: 24 }}
            />

            {/* Skeleton Action Grid */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 32,
              }}
            >
              <Skeleton width="48%" height={100} borderRadius={16} />
              <Skeleton width="48%" height={100} borderRadius={16} />
            </View>

            {/* Skeleton Recent Collections List */}
            <Skeleton width={180} height={24} style={{ marginBottom: 16 }} />
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
            {/* Agent Metrics Card */}
            <LinearGradient
              colors={[
                colors.heroGradient[0],
                colors.heroGradient[1],
                colors.heroGradient[2],
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroCard, { borderRadius: radius.xl }]}
            >
              <Text style={[styles.heroSub, { color: colors.borderGreen }]}>
                Today's Collection
              </Text>
              <Text style={styles.heroMain}>
                {formatINR(agent.todayCollection)}
              </Text>

              <View style={styles.divider} />

              <View style={styles.metricsRow}>
                <View>
                  <Text
                    style={[styles.metricLabel, { color: colors.borderGreen }]}
                  >
                    Total Collections
                  </Text>
                  <Text style={styles.metricValue}>
                    {formatINR(agent.totalCollection)}
                  </Text>
                </View>

                <View style={styles.verticalDivider} />

                <View>
                  <Text
                    style={[styles.metricLabel, { color: colors.borderGreen }]}
                  >
                    Assigned Customers
                  </Text>
                  <Text style={styles.metricValue}>
                    {agent.assignedCustomers.length}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.surface, borderRadius: radius.lg },
                ]}
                onPress={() => navigation.navigate(ROUTES.ADD_COLLECTION)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <AppIcon name="plus" size={24} color={colors.primary} />
                </View>
                <Text
                  style={[
                    typography.subtitle,
                    { color: colors.textPrimary, marginTop: 8 },
                  ]}
                >
                  Record Collection
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.surface, borderRadius: radius.lg },
                ]}
                onPress={() => navigation.navigate(ROUTES.ASSIGNED_CUSTOMERS)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconCircle,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <AppIcon name="users" size={24} color={colors.primary} />
                </View>
                <Text
                  style={[
                    typography.subtitle,
                    { color: colors.textPrimary, marginTop: 8 },
                  ]}
                >
                  Customer List
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Collections */}
            <Text
              style={[
                typography.h3,
                styles.sectionTitle,
                { color: colors.textPrimary },
              ]}
            >
              Recent Collections
            </Text>

            <View style={styles.collectionsList}>
              {agent.collections.map((col: CollectionRecord) => (
                <Card
                  key={col.id}
                  style={styles.colCard}
                  variant="flat"
                  padding={14}
                >
                  <View style={styles.colRow}>
                    <View>
                      <Text
                        style={[typography.h4, { color: colors.textPrimary }]}
                      >
                        {col.customerName}
                      </Text>
                      <Text
                        style={[
                          typography.caption,
                          { color: colors.textMuted, marginTop: 2 },
                        ]}
                      >
                        Loan ID: {col.loanId} • {col.paymentMethod}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          typography.h4,
                          { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        + {formatINR(col.amount)}
                      </Text>
                      <Text
                        style={[
                          typography.caption,
                          { color: colors.textMuted, marginTop: 2 },
                        ]}
                      >
                        {col.date}
                      </Text>
                    </View>
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
    marginBottom: 20,
  },
  heroSub: {
    color: '#CCFBF1',
    fontSize: 13,
    fontWeight: '500',
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
    color: '#CCFBF1',
    fontSize: 11,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  collectionsList: {
    gap: 10,
  },
  colCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  colRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
