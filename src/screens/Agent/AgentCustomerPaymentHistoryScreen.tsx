import React from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';

export const AgentCustomerPaymentHistoryScreen: React.FC = () => {
  const route = useRoute<any>();
  const { customerId, customerName } = route.params || {};
  const { colors, typography, radius } = useAppTheme();

  // Assuming `collections` holds history. In a real app, this might be a specific API call.
  const allCollections = useAppSelector(state => state.agent.collections);
  const customerHistory = allCollections.filter(
    col => String(col.customerId) === String(customerId),
  );

  const renderHistoryItem = ({
    item,
  }: {
    item: (typeof customerHistory)[0];
  }) => (
    <View
      style={[
        styles.historyCard,
        { backgroundColor: colors.surface, borderColor: colors.borderLight },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateRow}>
          <AppIcon
            name="calendar"
            size={14}
            color={colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {item.date}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
          <Text
            style={[
              typography.caption,
              { color: '#166534', fontSize: 10, fontWeight: '700' },
            ]}
          >
            Completed
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      <View style={styles.cardBody}>
        <View>
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, marginBottom: 2 },
            ]}
          >
            Payment Method
          </Text>
          <View style={styles.methodRow}>
            <AppIcon
              name={
                item.paymentMethod.toLowerCase() === 'cash'
                  ? 'credit-card'
                  : 'smartphone'
              }
              size={14}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.textPrimary, fontWeight: '600' },
              ]}
            >
              {item.paymentMethod}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text
            style={[
              typography.caption,
              {
                color: colors.textSecondary,
                marginBottom: 2,
                textAlign: 'right',
              },
            ]}
          >
            Amount
          </Text>
          <Text
            style={[
              typography.h4,
              { color: colors.primary, fontWeight: '800' },
            ]}
          >
            {formatINR(item.amount)}
          </Text>
        </View>
      </View>

      {item.remarks ? (
        <View
          style={[
            styles.remarksBox,
            { backgroundColor: '#F8FAFC', borderRadius: radius.sm },
          ]}
        >
          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, fontStyle: 'italic' },
            ]}
          >
            "{item.remarks}"
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={`${customerName ? customerName + "'s " : ''}Payment History`}
        showBack={true}
      />

      <FlatList
        data={customerHistory}
        keyExtractor={item => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppIcon name="clock" size={48} color={colors.border} />
            <Text
              style={[
                typography.bodyLarge,
                { color: colors.textMuted, marginTop: 16 },
              ]}
            >
              No payment history found.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  remarksBox: {
    marginTop: 12,
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
});
