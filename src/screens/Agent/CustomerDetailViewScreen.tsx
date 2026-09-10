import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { Badge } from '../../component/Common/Badge';
import { CustomButton } from '../../component/Common/CustomButton';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { AssignedCustomer } from '../../types/models';

export const CustomerDetailViewScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useAppTheme();
  const agent = useAppSelector(state => state.agent);

  const customerId = route.params?.customerId || agent.assignedCustomers[0]?.id;
  const customer = agent.assignedCustomers.find((c: AssignedCustomer) => c.id === customerId) || agent.assignedCustomers[0];

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleCollect = () => {
    navigation.navigate(ROUTES.ADD_COLLECTION, {
      customerId: customer.id,
      defaultAmount: customer.pendingAmount,
    });
  };

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Customer Details" showBack={true} />
        <View style={styles.emptyCenter}>
          <Text style={[typography.body, { color: colors.textMuted }]}>Customer not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Customer Profile & Loan" showBack={true} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={150} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={180} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={150} borderRadius={16} />
          </View>
        ) : (
          <>
            {/* Customer Header Card */}
            <Card style={[styles.profileCard, { borderColor: colors.border }]} variant="elevated">
              <View style={styles.profileTop}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>{customer.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>{customer.name}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {customer.phone}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    Area: {customer.address || 'Chennai Central'} • Loan ID: {customer.loanId}
                  </Text>
                </View>
                <Badge status={customer.isOverdue ? 'Overdue' : 'Active'} size="small" />
              </View>

              {/* Quick Contact Actions */}
              <View style={[styles.contactRow, { borderTopColor: colors.borderLight }]}>
                <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.primaryBackground, borderColor: colors.borderGreen, borderRadius: radius.full }]} onPress={handleCall}>
                  <AppIcon name="phone" size={16} color={colors.primary} />
                  <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>
                    Call Customer
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Loan Financial Summary */}
            <Card style={[styles.loanCard, { borderColor: colors.border }]} variant="elevated">
              <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: 12, fontWeight: '700' }]}>
                Loan Financial Status
              </Text>

          <View style={styles.statGrid}>
            <View style={styles.statCol}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Pending Due</Text>
              <Text style={[typography.h3, { color: colors.primary, fontWeight: '800', marginTop: 2 }]}>
                {formatINR(customer.pendingAmount)}
              </Text>
            </View>

            <View style={styles.statCol}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Next Due Date</Text>
              <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: '700', marginTop: 2 }]}>
                {customer.dueDate}
              </Text>
            </View>

            <View style={styles.statCol}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[typography.h4, { color: customer.isOverdue ? colors.errorText : colors.primary, fontWeight: '700', marginTop: 2 }]}>
                {customer.isOverdue ? 'Overdue' : 'On Track'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Button to Collect */}
        <CustomButton
          title={`Collect Due (${formatINR(customer.pendingAmount)})`}
          onPress={handleCollect}
          variant="primary"
          style={{ marginTop: 10, marginBottom: 20 }}
          gradientColors={colors.buttonGradient}
        />
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
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  loanCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    alignItems: 'center',
  },
});
