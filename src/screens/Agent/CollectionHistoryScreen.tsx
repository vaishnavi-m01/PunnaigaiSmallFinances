import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppIcon } from '../../component/AppIcon';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { CollectionRecord } from '../../types/models';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatINR } from '../../utils/currency';


export const CollectionHistoryScreen: React.FC = () => {
  const { colors, typography } = useAppTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const collections = useAppSelector(state => state.agent.collections);
  
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('Today');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const timeFilters = ['Today', 'Week', 'Month', 'Year'];

  const filtered = collections.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    // Simple mock time filter for UI presentation
    // In a real app, this would compare item.date with current date ranges
    return true; // For demonstration, showing all in the selected filter
  });

  const totalFilteredAmount = filtered.reduce((sum, item) => sum + item.amount, 0);



  const renderCollection = ({ item }: { item: CollectionRecord }) => {
    const isSuccessful = !item.receiptNumber?.startsWith('REJ');

    return (
      <View style={[styles.collectionCard, { backgroundColor: colors.white }]}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isSuccessful ? '#DCFCE7' : '#FEE2E2' },
            ]}
          >
            {isSuccessful ? (
              <AppIcon name="check" size={16} color="#16A34A" />
            ) : (
              <AppIcon name="x" size={16} color="#EF4444" />
            )}
          </View>
          <View style={styles.details}>
            <Text style={[typography.bodyLarge, styles.customerName, { color: '#0F172A' }]}>
              {item.customerName}
            </Text>
            <Text style={[typography.caption, { color: '#64748B' }]}>
              {item.date || '12 Sep 2026, 10:30 AM'}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text
            style={[
              typography.bodyLarge,
              styles.amount,
              { color: isSuccessful ? '#16A34A' : '#EF4444' },
            ]}
          >
            {formatINR(item.amount)}
          </Text>
          <Text style={[typography.caption, { color: '#94A3B8' }]}>
            Via {item.paymentMethod || 'Cash'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      
      <Header 
        title="Collection History" 
        showBack={false}
        showNotification={true}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => setIsFilterDropdownOpen(true)}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#CBD5E1',
                paddingHorizontal: 12, 
                paddingVertical: 6, 
                borderRadius: 8 
              }}
            >
              <Text style={[typography.caption, { color: '#0F172A', fontWeight: '600', marginRight: 6 }]}>
                {activeTab}
              </Text>
              <AppIcon name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.content}>



          {/* Hero Card */}
          <LinearGradient
            colors={['#047857', '#064E3B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTop}>
              <View style={[styles.investIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <AppIcon name="calendar" size={18} color="#FFFFFF" />
              </View>
              <Text style={[typography.subtitle, { color: colors.white, marginLeft: 12, opacity: 0.9 }]}>
                Total for {activeTab}
              </Text>
            </View>
            <Text style={[typography.h1, { color: colors.white, marginTop: 16, fontSize: 32, fontWeight: 'bold' }]}>
              {formatINR(totalFilteredAmount)}
            </Text>
          </LinearGradient>

          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderCollection}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppIcon name="clock" size={44} color={colors.border} />
                <Text style={[typography.bodyLarge, { color: '#94A3B8', marginTop: 12 }]}>
                  No collections found for this month.
                </Text>
              </View>
            }
          />
        </View>
    
      {/* Filter Dropdown Modal */}
      <Modal visible={isFilterDropdownOpen} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setIsFilterDropdownOpen(false)}
        >
          <View style={styles.dropdownCard}>
            <Text style={[typography.subtitle, { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, color: '#64748B' }]}>
              Filter by Time
            </Text>
            {timeFilters.map((filter, index) => {
              const isSelected = activeTab === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.dropdownItem, index !== timeFilters.length - 1 && styles.dropdownItemBorder]}
                  onPress={() => {
                    setActiveTab(filter);
                    setIsFilterDropdownOpen(false);
                  }}
                >
                  <Text style={[typography.bodyMedium, { color: isSelected ? '#10B981' : '#0F172A', fontWeight: isSelected ? '700' : '500' }]}>
                    {filter}
                  </Text>
                  {isSelected && <AppIcon name="check" size={16} color="#10B981" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  investIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 32,
  },
  collectionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    justifyContent: 'center',
  },
  customerName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  iconBtn: {
    padding: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90, // Position just under the header
    paddingRight: 16,
  },
  dropdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 180,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
});
