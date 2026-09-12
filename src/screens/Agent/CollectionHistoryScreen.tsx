import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppIcon } from '../../component/AppIcon';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { CollectionRecord } from '../../types/models';
import { formatINR } from '../../utils/currency';

const HeaderGraphic = () => (
  <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]} pointerEvents="none">
    <View style={{
      position: 'absolute',
      top: -30,
      right: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.06)'
    }} />
    <View style={{
      position: 'absolute',
      top: 40,
      right: -80,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(255,255,255,0.04)'
    }} />
  </View>
);

export const CollectionHistoryScreen: React.FC = () => {
  const { colors, typography } = useAppTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const collections = useAppSelector(state => state.agent.collections);
  
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('Today');

  const timeFilters = ['Today', 'Week', 'Month', 'Year'];

  const filtered = collections.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    // Simple mock time filter for UI presentation
    // In a real app, this would compare item.date with current date ranges
    return true; // For demonstration, showing all in the selected filter
  });

  const totalFilteredAmount = filtered.reduce((sum, item) => sum + item.amount, 0);

  const renderTab = (tab: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        key={tab}
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive ? '#10B981' : colors.white,
            borderColor: isActive ? '#10B981' : '#E2E8F0',
            borderWidth: 1,
          },
        ]}
        onPress={() => setActiveTab(tab)}
      >
        <Text
          style={[
            typography.caption,
            {
              color: isActive ? colors.white : '#64748B',
              fontWeight: isActive ? '700' : '500',
            },
          ]}
        >
          {tab}
        </Text>
      </TouchableOpacity>
    );
  };

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
    <View style={[styles.container, { backgroundColor: '#168B5E' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0B533E', '#168B5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}
      >
        <HeaderGraphic />
        <View style={styles.headerTopRow}>
          {!isSearchActive ? (
            <>
              <Text style={[typography.h3, { color: colors.white, flex: 1, paddingLeft: 8 }]}>
                Collection History
              </Text>
              <TouchableOpacity onPress={() => setIsSearchActive(true)} style={styles.iconBtn}>
                <AppIcon name="search" size={24} color={colors.white} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.searchContainer, { backgroundColor: colors.white }]}>
              <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearch(''); }}>
                <AppIcon name="arrow-left" size={20} color="#94A3B8" />
              </TouchableOpacity>
              <TextInput
                placeholder="Search transactions..."
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, typography.bodyMedium, { color: '#0F172A' }]}
                placeholderTextColor="#94A3B8"
                autoFocus
              />
              <TouchableOpacity onPress={() => setSearch('')}>
                <AppIcon name="x" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.pageContainer}>
        <View style={styles.content}>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {timeFilters.map(renderTab)}
          </View>

          {/* Hero Card */}
          <LinearGradient
            colors={['#10B981', '#059669']}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
  },
  iconBtn: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    height: '100%',
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
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
});
