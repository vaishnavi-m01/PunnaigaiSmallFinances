import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { Header } from '../../component/Header';
import { searchCustomers } from '../../services/api/partnerApi';
import { formatINR } from '../../utils/currency';

const FinanceCard = ({ finance, schedules, typography }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displaySchedules = isExpanded ? schedules : schedules.slice(0, 3);
  const hiddenCount = schedules.length - 3;

  return (
    <View style={styles.financeContainer}>
      <View style={styles.financeHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.financeIconBox}>
            <AppIcon name="briefcase" size={14} color="#047857" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={[typography.bodyMedium, { color: '#0F172A', fontWeight: '700' }]}>
              {finance.loan_package_name}
            </Text>
            <Text style={[typography.caption, { color: '#64748B' }]}>
              {finance.finance_code} • {finance.start_date}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[typography.caption, { color: '#64748B' }]}>Outstanding</Text>
          <Text style={[typography.bodyLarge, { color: '#EF4444', fontWeight: '800' }]}>
            {formatINR(finance.outstanding_amount)}
          </Text>
        </View>
      </View>

      {/* Repayment Schedules */}
      {schedules.length > 0 && (
        <View style={styles.schedulesWrapper}>
          <Text style={[typography.caption, { color: '#0F172A', fontWeight: '600', marginBottom: 6 }]}>
            Repayment Schedules ({schedules.length})
          </Text>
          
          {displaySchedules.map((schedule: any) => (
            <View key={`sched_${schedule.id}`} style={styles.scheduleRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.scheduleStatusDot, { backgroundColor: schedule.status === 'pending' ? '#F59E0B' : '#10B981' }]} />
                <Text style={[typography.caption, { color: '#475569', marginLeft: 8 }]}>
                  Due: <Text style={{ fontWeight: '600', color: '#0F172A' }}>{schedule.due_date}</Text>
                </Text>
              </View>
              <Text style={[typography.bodyMedium, { color: '#0F172A', fontWeight: '700' }]}>
                {formatINR(schedule.amount)}
              </Text>
            </View>
          ))}

          {hiddenCount > 0 && (
            <TouchableOpacity 
              onPress={() => setIsExpanded(!isExpanded)} 
              style={{ marginTop: 8, paddingVertical: 4, alignItems: 'center' }}
            >
              <Text style={[typography.caption, { color: '#3B82F6', fontWeight: '600' }]}>
                {isExpanded ? 'Hide schedules' : `+ ${hiddenCount} more schedules`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Collect Button */}
      <TouchableOpacity style={styles.collectBtn} activeOpacity={0.8}>
        <AppIcon name="dollar-sign" size={14} color="#FFFFFF" />
        <Text style={[typography.bodyMedium, { color: '#FFFFFF', fontWeight: '700', marginLeft: 6 }]}>
          Collect Payment
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const PartnerCustomersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.length >= 3) {
      setIsLoading(true);
      try {
        const res = await searchCustomers(text);
        console.log("Customer Search API Response:", JSON.stringify(res, null, 2));
        setCustomers(Array.isArray(res) ? res : (res?.data || []));
      } catch (err: any) {
        console.log("Customer Search API Error:", err?.message || err);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCustomers([]);
    }
  };

  const getAvatarColor = (name: string) => {
    const avatarColors = ['#059669', '#0284C7', '#7C3AED', '#EA580C', '#DB2777'];
    const charCode = (name || '').charCodeAt(0) || 0;
    return avatarColors[charCode % avatarColors.length];
  };

  const renderCustomerItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.customerCard, { backgroundColor: colors.white }]}>
        {/* Customer Header */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardLeft}>
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
              <Text style={[typography.h2, { color: colors.white, fontWeight: '700', fontSize: 20 }]}>
                {(item.name || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[typography.h3, { color: '#0F172A', fontWeight: '700' }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[typography.caption, { color: '#64748B', marginTop: 2 }]} numberOfLines={1}>
                {item.customer_code || item.id}  •  {item.mobile || item.phone}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#ECFDF5' : '#FEF2F2' }]}>
            <Text style={[typography.caption, { color: item.status === 'active' ? '#059669' : '#DC2626', fontWeight: '600' }]}>
              {item.status ? item.status.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>
        </View>

        {/* Loop through all active finances for this customer */}
        {item.finances && item.finances.length > 0 ? (
          item.finances.map((finance: any) => {
            const schedules = item.repayment_schedules?.filter((s: any) => s.finance_id === finance.id) || [];
            return (
              <FinanceCard 
                key={`finance_${finance.id}`} 
                finance={finance} 
                schedules={schedules} 
                typography={typography} 
              />
            );
          })
        ) : (
          <View style={styles.noFinanceBox}>
            <Text style={[typography.bodyMedium, { color: '#64748B', textAlign: 'center' }]}>
              No active loans found.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Simple Neat Header */}
      <Header title="Customers" showBack={true} showNotification={false} />

      {/* Search Bar inside the page */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBox, 
          isFocused ? styles.searchBoxFocused : null,
        ]}>
          <AppIcon name="search" size={20} color={isFocused ? '#047857' : '#94A3B8'} />
          <TextInput
            ref={searchInputRef}
            placeholder="Search by ID, name, or phone..."
            value={search}
            onChangeText={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[styles.searchInput, typography.bodyMedium, { color: '#0F172A' }]}
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); Keyboard.dismiss(); }}>
              <AppIcon name="x-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={customers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCustomerItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <AppIcon name="users" size={40} color="#94A3B8" />
              </View>
              <Text style={[typography.h3, { color: '#475569', marginTop: 16, textAlign: 'center' }]}>
                {search.trim() === '' ? 'Find a Customer' : 'No customers found'}
              </Text>
              <Text style={[typography.bodyMedium, { color: '#94A3B8', textAlign: 'center', marginTop: 8, paddingHorizontal: 32 }]}>
                {search.trim() === '' 
                  ? 'Use the search bar above to instantly find customer details.' 
                  : `We couldn't find any match for "${search}".`}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchBoxFocused: {
    borderColor: '#047857',
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    height: '100%',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  customerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  financeContainer: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  financeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  financeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  schedulesWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  scheduleStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  collectBtn: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  noFinanceBox: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
