import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { fetchAssignedCustomersThunk } from '../../features/agent/collectionThunks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { Badge } from '../../component/Common/Badge';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { AssignedCustomer } from '../../types/models';

export const AssignedCustomersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { colors, typography, radius } = useAppTheme();
  const customers = useAppSelector(state => state.agent.assignedCustomers);
  const isLoading = useAppSelector(state => state.agent.isLoading);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignedCustomersThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchAssignedCustomersThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const filtered = customers.filter(
    (c: AssignedCustomer) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.loanId.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const renderCustomerItem = ({ item }: { item: AssignedCustomer }) => (
    <Card style={[styles.customerCard, { borderColor: colors.border }]} variant="elevated" padding={14}>
      <View style={styles.cardTop}>
        <View style={styles.userLeft}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primarySoft }]}>
            <AppIcon name="user" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: '700' }]}>{item.name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              {item.phone} • {item.loanId}
            </Text>
          </View>
        </View>

        <Badge
          status={item.isOverdue ? 'Overdue' : 'Active'}
          label={item.isOverdue ? 'Overdue' : 'Regular'}
          size="small"
        />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      <View style={styles.cardBottom}>
        <View>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '500' }]}>Pending Amount</Text>
          <Text style={[typography.h4, { color: item.isOverdue ? colors.errorText : colors.textPrimary, fontWeight: '800' }]}>
            {formatINR(item.pendingAmount)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.collectBtn, { backgroundColor: colors.primary, borderRadius: radius.sm }]}
          onPress={() =>
            navigation.navigate(ROUTES.ADD_COLLECTION, {
              customerId: item.id,
              defaultAmount: item.pendingAmount,
            })
          }
          activeOpacity={0.8}
        >
          <Text style={[typography.caption, { color: colors.white, fontWeight: '800' }]}>
            Collect
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <Header title="Assigned Customers" showBack={false} showNotification={true} />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={[styles.searchBar, { borderRadius: radius.md, backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppIcon name="search" size={20} color={colors.textMuted} />
          <TextInput
            placeholder="Search by customer name, phone, or loan ID..."
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, typography.bodyMedium, { color: colors.textPrimary }]}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {isLoading || isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} height={110} borderRadius={14} style={{ marginBottom: 10 }} />
            ))}
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderCustomerItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: 20,
  },
  customerCard: {
    borderWidth: 1,
    borderRadius: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
});
