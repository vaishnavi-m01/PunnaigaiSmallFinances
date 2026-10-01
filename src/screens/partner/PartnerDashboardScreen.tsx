import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  Platform,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import {
  fetchPartnerDashboardThunk,
  fetchPartnerContributionsThunk,
  fetchPartnerTransactionsThunk,
  fetchPartnerWithdrawalsThunk,
  fetchPartnerPartnershipsThunk,
  fetchPartnerProfileThunk,
  fetchPartnerOverallProfitCollectionThunk,
  setSelectedPartnershipCode,
} from '../../store/partnerSlice';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from '../../context/LanguageContext';

const PartnerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const dispatch = useAppDispatch();
  const partner = useAppSelector(state => state.partner);
  console.log('partner', partner);
  const user = useAppSelector(state => state.auth.user);
  const { t } = useTranslation();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterWidth, setFilterWidth] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  const isTodayFilter = isToday(fromDate) && isToday(toDate);

  const orderedPartnerships = React.useMemo(() => {
    if (!partner.partnerships) return [];
    const pList = [...partner.partnerships];
    pList.sort((a, b) => {
      const nameA = a.partner?.name || a.partnership_name;
      const nameB = b.partner?.name || b.partnership_name;
      if (nameA === user?.name) return -1;
      if (nameB === user?.name) return 1;
      return 0;
    });
    return pList;
  }, [partner.partnerships, partner.partners, user]);

  const selectedIndex = React.useMemo(() => {
    if (!orderedPartnerships) return 0;
    const index = orderedPartnerships.findIndex(
      p => p.partnership_code === partner.selectedPartnershipCode,
    );
    return index === -1 ? 0 : index;
  }, [orderedPartnerships, partner.selectedPartnershipCode]);

  // Auto-select the logged-in user initially
  const [initialSelectDone, setInitialSelectDone] = useState(false);
  useEffect(() => {
    if (!initialSelectDone && orderedPartnerships.length > 0) {
      if (!partner.selectedPartnershipCode) {
        dispatch(
          setSelectedPartnershipCode(orderedPartnerships[0].partnership_code),
        );
      }
      setInitialSelectDone(true);
    }
  }, [
    orderedPartnerships,
    initialSelectDone,
    partner.selectedPartnershipCode,
    dispatch,
  ]);

  useEffect(() => {
    if (filterWidth > 0 && orderedPartnerships.length > 0) {
      const tabWidth = filterWidth / orderedPartnerships.length;
      Animated.spring(slideAnim, {
        toValue: selectedIndex * tabWidth,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    }
  }, [selectedIndex, filterWidth, orderedPartnerships.length]);

  const idToFetch = React.useMemo(() => {
    const selectedP = orderedPartnerships?.find(
      p => p.partnership_code === partner.selectedPartnershipCode,
    );
    return selectedP ? selectedP.partnership_id : undefined;
  }, [orderedPartnerships, partner.selectedPartnershipCode]);

  // On mount, get the list of partnerships unconditionally to ensure filter is always up to date
  useEffect(() => {
    dispatch(fetchPartnerPartnershipsThunk());
  }, [dispatch]);

  // On focus, get partnerships and dashboard data to ensure everything is up to date when returning from Wallet
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchPartnerPartnershipsThunk());
      dispatch(fetchPartnerProfileThunk());
      if (idToFetch !== undefined) {
        const params: any = { partnership_id: idToFetch };
        if (fromDate) params.from_date = fromDate.toISOString().split('T')[0];
        if (toDate) params.to_date = toDate.toISOString().split('T')[0];
        dispatch(fetchPartnerDashboardThunk(params));
        dispatch(fetchPartnerOverallProfitCollectionThunk({ partnership_id: idToFetch }));
      }
    }, [dispatch, idToFetch, fromDate, toDate]),
  );

  // Fetch Dashboard data once we know the selected ID
  useEffect(() => {
    if (idToFetch !== undefined) {
      const timer = setTimeout(() => {
        const params: any = { partnership_id: idToFetch };
        if (fromDate) params.from_date = fromDate.toISOString().split('T')[0];
        if (toDate) params.to_date = toDate.toISOString().split('T')[0];

        dispatch(fetchPartnerDashboardThunk(params));
        dispatch(fetchPartnerOverallProfitCollectionThunk({ partnership_id: idToFetch }));
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [dispatch, idToFetch, fromDate, toDate]);

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    const selectedP = partner.partnerships?.find(
      p => p.partnership_code === partner.selectedPartnershipCode,
    );
    const currentId = selectedP ? selectedP.partnership_id : undefined;

    // Always refresh the partnership list too!
    // MUST run sequentially: fetch list first, then fetch rich dashboard data
    // to avoid the list API wiping out the recent_transactions data.
    await dispatch(fetchPartnerPartnershipsThunk());
    await dispatch(fetchPartnerProfileThunk());
    if (currentId !== undefined) {
      const params: any = { partnership_id: currentId };
      if (fromDate) params.from_date = fromDate.toISOString().split('T')[0];
      if (toDate) params.to_date = toDate.toISOString().split('T')[0];

      await dispatch(fetchPartnerDashboardThunk(params));
      await dispatch(fetchPartnerOverallProfitCollectionThunk({ partnership_id: currentId }));
    }

    setIsRefreshing(false);
  }, [
    dispatch,
    partner.selectedPartnershipCode,
    partner.partnerships,
    fromDate,
    toDate,
  ]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const today = new Date();
    setFromDate(today);
    setToDate(today);

    const selectedP = partner.partnerships?.find(
      p => p.partnership_code === partner.selectedPartnershipCode,
    );
    const currentId = selectedP ? selectedP.partnership_id : undefined;

    await dispatch(fetchPartnerPartnershipsThunk());
    await dispatch(fetchPartnerProfileThunk());
    if (currentId !== undefined) {
      const params: any = { partnership_id: currentId };
      params.from_date = today.toISOString().split('T')[0];
      params.to_date = today.toISOString().split('T')[0];

      await dispatch(fetchPartnerDashboardThunk(params));
      await dispatch(fetchPartnerOverallProfitCollectionThunk({ partnership_id: currentId }));
    }

    setIsRefreshing(false);
  }, [dispatch, partner.selectedPartnershipCode, partner.partnerships]);

  const getPartnerName = (code?: string) => {
    if (!code) return 'Partner';
    const p = partner?.partnerships?.find(pt => pt.partnership_code === code);
    const name = p?.partner?.name || p?.partnership_name;
    return name ? `${name}'s` : 'Partner';
  };

  const selectedPartnership =
    partner.partnerships?.find(
      p => p.partnership_code === partner.selectedPartnershipCode,
    ) || partner.partnerships?.[0];
  const apiRecentTx = (selectedPartnership as any)?.recent_transactions || [];

  const recentTransactions = apiRecentTx
    .map((tx: any) => ({
      id: `tx_${tx.id}`,
      title:
        tx.description ||
        (tx.transaction_type === 'partner_contribution'
          ? 'Investment Added'
          : 'Profit Share'),
      amount: Number(tx.amount),
      date: formatDate(tx.transaction_date),
      type: tx.direction === 'in' ? 'credit' : 'debit',
      icon:
        tx.transaction_type === 'partner_contribution'
          ? 'triangle'
          : 'briefcase',
      iconColor: tx.direction === 'in' ? '#10B981' : '#EF4444',
      iconBg: tx.direction === 'in' ? '#D1FAE5' : '#FEE2E2',
    }))
    .slice(0, 5);

  // User requested to hide partner name from titles
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return (t('Good Morning') || 'Good Morning') + ' ☀️';
    if (hour < 17) return (t('Good Afternoon') || 'Good Afternoon') + ' 🌤️';
    return (t('Good Evening') || 'Good Evening') + ' 🌙';
  };

  const profileImage = (partner.profile as any)?.profile_image_url || null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <View
        style={[styles.topHeader, { paddingTop: Math.max(insets.top + 6, 16) }]}
      >
        <View style={styles.headerLeft}>
          {/* Greeting Text */}
          <View style={styles.nameBlock}>
            <Text style={styles.greetingSubtitle}>{getGreeting()}</Text>
            <Text style={styles.greetingTitle}>
              {user?.name?.split(' ')[0] || 'Partner'}
            </Text>
          </View>
        </View>

        {/* User Avatar Circle (moved from left) */}
        <TouchableOpacity
          style={[styles.avatarCircleHeader, { overflow: 'hidden' }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(ROUTES.PARTNER_PROFILE)}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={{ width: 48, height: 48 }}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarInner}>
              <AppIcon name="user" size={22} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>

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
        {showFromPicker && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode="date"
            display="default"
            maximumDate={toDate || undefined}
            onChange={(event, selectedDate) => {
              setShowFromPicker(Platform.OS === 'ios');
              if (selectedDate) setFromDate(selectedDate);
            }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            minimumDate={fromDate || undefined}
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowToPicker(Platform.OS === 'ios');
              if (selectedDate) setToDate(selectedDate);
            }}
          />
        )}

        {/* Premium Wallet Hero Card with Integrated Date Pickers */}
        <LinearGradient
          colors={['#047857', '#022C22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.investmentCard,
            { marginBottom: 24, borderRadius: 20, padding: 16 },
          ]}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { overflow: 'hidden', borderRadius: 20 },
            ]}
            pointerEvents="none"
          >
            <View
              style={{
                position: 'absolute',
                bottom: -40,
                right: -20,
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: -20,
                right: 60,
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            />
          </View>

          {/* Top Section: Date Pickers Inside Hero */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowFromPicker(true)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: 8,
                borderRadius: 12,
                marginRight: 6,
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.smallIconCircle,
                  {
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    marginRight: 8,
                    width: 28,
                    height: 28,
                  },
                ]}
              >
                <AppIcon name="calendar" size={12} color="#34D399" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: 10,
                      marginBottom: 2,
                    },
                  ]}
                >
                  {t('From Date') || 'From Date'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={[
                      typography.subtitle,
                      {
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: '700',
                        marginRight: 4,
                      },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {fromDate ? formatDate(fromDate.toISOString()) : 'dd-mm-yyyy'}
                  </Text>
                  <AppIcon
                    name="chevron-down"
                    size={12}
                    color="rgba(255,255,255,0.6)"
                  />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowToPicker(true)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: 8,
                borderRadius: 12,
                marginLeft: 6,
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.smallIconCircle,
                  {
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    marginRight: 8,
                    width: 28,
                    height: 28,
                  },
                ]}
              >
                <AppIcon name="calendar" size={12} color="#34D399" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: 10,
                      marginBottom: 2,
                    },
                  ]}
                >
                  {t('To Date') || 'To Date'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={[
                      typography.subtitle,
                      {
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: '700',
                        marginRight: 4,
                      },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {toDate ? formatDate(toDate.toISOString()) : 'dd-mm-yyyy'}
                  </Text>
                  <AppIcon
                    name="chevron-down"
                    size={12}
                    color="rgba(255,255,255,0.6)"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.1)',
              marginBottom: 12,
            }}
          />

          {/* Bottom Section: Collection & Profit or Skeletons */}
          {isRefreshing || partner.isLoading ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 4,
              }}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Skeleton
                  width={100}
                  height={14}
                  borderRadius={4}
                  style={{ marginBottom: 8, opacity: 0.3 }}
                />
                <Skeleton
                  width={120}
                  height={28}
                  borderRadius={8}
                  style={{ opacity: 0.5 }}
                />
              </View>
              <View
                style={{
                  width: 1,
                  height: 40,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  marginHorizontal: 16,
                }}
              />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Skeleton
                  width={100}
                  height={14}
                  borderRadius={4}
                  style={{ marginBottom: 8, opacity: 0.3 }}
                />
                <Skeleton
                  width={120}
                  height={28}
                  borderRadius={8}
                  style={{ opacity: 0.5 }}
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 4,
              }}
            >
              {/* Collection Side */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: 4,
                      letterSpacing: 0.5,
                    },
                  ]}
                >
                  {isTodayFilter
                    ? t('Today Collection') || 'Today Collection'
                    : t('Total Collection') || 'Total Collection'}
                </Text>
                <Text
                  style={[
                    typography.h2,
                    { color: '#FFFFFF', fontWeight: '800', fontSize: 22 },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatINR(partner?.summary?.total_collection ?? 0)}
                </Text>
              </View>

              {/* Center Line */}
              <View
                style={{
                  width: 1,
                  height: 40,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  marginHorizontal: 16,
                }}
              />

              {/* Profit Side */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: 4,
                      letterSpacing: 0.5,
                    },
                  ]}
                >
                  {isTodayFilter
                    ? t('Today Profit') || 'Today Profit'
                    : t('Total Profit') || 'Total Profit'}
                </Text>
                <Text
                  style={[
                    typography.h2,
                    { color: '#FFFFFF', fontWeight: '800', fontSize: 22 },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatINR(partner?.summary?.total_profit ?? 0)}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 24,
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#F5F3FF',
              borderRadius: 16,
              padding: 12,
            }}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.MY_EARNINGS)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#8B5CF6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <AppIcon name="hand-coin" size={14} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#5B21B6',
                    fontWeight: '600',
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t('Total Collection') || 'Total Collection'}
                </Text>
                {partner.isLoading && !isRefreshing ? (
                  <Skeleton width={80} height={20} borderRadius={4} />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#5B21B6',
                      fontWeight: '800',
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {formatINR(partner?.overallTotals?.total_collection ?? 0)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Available Balance Card */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#FFF7ED',
              borderRadius: 16,
              padding: 12,
            }}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.PARTNER_WALLET)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F97316',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <AppIcon name="trending-up" size={14} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#9A3412',
                    fontWeight: '600',
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t('Total Profit') || 'Total Profit'}
                </Text>
                {partner.isLoading && !isRefreshing ? (
                  <Skeleton width={80} height={20} borderRadius={4} />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#9A3412',
                      fontWeight: '800',
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {formatINR(partner?.overallTotals?.total_profit ?? 0)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>



        {isRefreshing || partner.isLoading ? (
          <View>
            <Skeleton
              height={100}
              borderRadius={24}
              style={{ marginBottom: 24 }}
            />
          </View>
        ) : (
          <>
            {/* Partnership Filter */}
            {orderedPartnerships && orderedPartnerships.length > 0 && (
              <View style={[styles.filterContainer, { marginBottom: 24 }]}>
                {orderedPartnerships.map((p, index) => {
                  const partnerName =
                    p.partner?.name ||
                    p.partnership_name ||
                    `Partner ${index + 1}`;
                  const isSelected = selectedIndex === index;
                  return (
                    <TouchableOpacity
                      key={p.partnership_id}
                      style={[
                        styles.pillTab,
                        isSelected && {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          elevation: 2,
                          shadowColor: '#000',
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          shadowOffset: { width: 0, height: 1 },
                        },
                      ]}
                      onPress={() =>
                        dispatch(setSelectedPartnershipCode(p.partnership_code))
                      }
                      activeOpacity={1}
                    >
                      <Text
                        style={[
                          styles.pillTabText,
                          isSelected && styles.pillTabTextActive,
                        ]}
                      >
                        {partnerName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Profit & Wallet Row (Image Match Design) */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 24,
                gap: 12,
              }}
            >
              {/* Total Investment Card */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#EDF2FE',
                  borderRadius: 16,
                  padding: 12,
                }}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(ROUTES.MY_EARNINGS)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#2563EB',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}
                  >
                    <AppIcon name="database" size={14} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#1E3A8A',
                        fontWeight: '600',
                        marginBottom: 2,
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {t('Total Investment') || 'Total Investment'}
                    </Text>
                    {partner.isLoading && !isRefreshing ? (
                      <Skeleton width={80} height={20} borderRadius={4} />
                    ) : (
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#1E3A8A',
                          fontWeight: '800',
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {formatINR(partner?.summary?.total_investment ?? 0)}
                      </Text>
                    )}
                  </View>
                  <AppIcon
                    name="chevron-right"
                    size={14}
                    color="#60A5FA"
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Available Balance Card */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#E8F8EE',
                  borderRadius: 16,
                  padding: 12,
                }}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(ROUTES.PARTNER_WALLET)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#10B981',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}
                  >
                    <AppIcon name="credit-card" size={14} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#064E3B',
                        fontWeight: '600',
                        marginBottom: 2,
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {t('Available Balance') || 'Available Balance'}
                    </Text>
                    {partner.isLoading && !isRefreshing ? (
                      <Skeleton width={80} height={20} borderRadius={4} />
                    ) : (
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#064E3B',
                          fontWeight: '800',
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {formatINR(partner?.summary?.available_balance ?? 0)}
                      </Text>
                    )}
                  </View>
                  <AppIcon
                    name="chevron-right"
                    size={14}
                    color="#34D399"
                    style={{ marginLeft: 4 }}
                  />
                </View>
                {/* <Text style={{ fontSize: 10, color: '#64748B', marginTop: 10, marginLeft: 40 }} numberOfLines={1}>
                  Available to use
                </Text> */}
              </TouchableOpacity>
            </View>

            {/* Quick Access */}
            <Text
              style={[
                typography.h3,
                styles.sectionTitle,
                { color: '#0F172A', marginTop: 8 },
              ]}
            >
              {t('Quick Access') || 'Quick Access'}
            </Text>

            <View style={styles.quickAccessGrid}>
              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate(ROUTES.PARTNER_CUSTOMERS)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.quickIconBox, { backgroundColor: '#EFF6FF' }]}
                >
                  <AppIcon name="users" size={24} color="#3B82F6" />
                </View>
                <Text
                  style={[
                    typography.subtitle,
                    { color: '#0F172A', marginTop: 8 },
                  ]}
                >
                  {t('Customers')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate(ROUTES.MY_EARNINGS)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.quickIconBox, { backgroundColor: '#ECFDF5' }]}
                >
                  <AppIcon name="trending-up" size={24} color="#10B981" />
                </View>
                <Text
                  style={[
                    typography.subtitle,
                    { color: '#0F172A', marginTop: 8 },
                  ]}
                >
                  {t('Investment') || 'Investment'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate(ROUTES.PARTNER_WALLET)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.quickIconBox, { backgroundColor: '#F5F3FF' }]}
                >
                  <AppIcon name="credit-card" size={24} color="#8B5CF6" />
                </View>
                <Text
                  style={[
                    typography.subtitle,
                    { color: '#0F172A', marginTop: 8 },
                  ]}
                >
                  {t('Wallet')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessItem}
                onPress={() => navigation.navigate(ROUTES.PARTNER_PROFILE)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.quickIconBox, { backgroundColor: '#FFF7ED' }]}
                >
                  <AppIcon name="user" size={24} color="#F97316" />
                </View>
                <Text
                  style={[
                    typography.subtitle,
                    { color: '#0F172A', marginTop: 8 },
                  ]}
                >
                  {t('Profile')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View style={styles.historyHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text
                  style={[typography.h3, { color: '#0F172A' }]}
                  numberOfLines={1}
                >
                  {t('Recent Transactions')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.PARTNER_WALLET)}
                style={{ flexShrink: 0 }}
              >
                <Text style={[typography.subtitle, { color: '#16A34A' }]}>
                  {t('See All') || 'See All'}
                </Text>
              </TouchableOpacity>
            </View>

            {partner.isLoading && !isRefreshing ? (
              <View style={{ marginTop: 8 }}>
                <Skeleton
                  height={70}
                  borderRadius={12}
                  style={{ marginBottom: 12 }}
                />
                <Skeleton
                  height={70}
                  borderRadius={12}
                  style={{ marginBottom: 12 }}
                />
                <Skeleton
                  height={70}
                  borderRadius={12}
                  style={{ marginBottom: 12 }}
                />
              </View>
            ) : (
              <View style={styles.txList}>
                {recentTransactions.length === 0 ? (
                  <View
                    style={[
                      styles.txCard,
                      { justifyContent: 'center', padding: 24 },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption,
                        { color: '#64748B', textAlign: 'center' },
                      ]}
                    >
                      {t('No recent transactions found') ||
                        'No recent transactions found'}
                    </Text>
                  </View>
                ) : (
                  recentTransactions.map((tx: any) => (
                    <View key={tx.id} style={styles.txCard}>
                      <View style={styles.txLeft}>
                        <View
                          style={[
                            styles.txIconBox,
                            { backgroundColor: tx.iconBg },
                          ]}
                        >
                          <AppIcon
                            name={tx.icon}
                            size={16}
                            color={tx.iconColor}
                          />
                        </View>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text
                            style={[typography.subtitle, { color: '#0F172A' }]}
                            numberOfLines={1}
                          >
                            {tx.title}
                          </Text>
                          <Text
                            style={[
                              typography.caption,
                              { color: '#64748B', marginTop: 2 },
                            ]}
                            numberOfLines={1}
                          >
                            {tx.date}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.txRight}>
                        <Text
                          style={[
                            typography.subtitle,
                            {
                              color:
                                tx.type === 'credit' ? '#10B981' : '#EF4444',
                            },
                          ]}
                        >
                          {tx.type === 'credit' ? '+ ' : '- '}
                          {formatINR(tx.amount)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};
export { PartnerDashboardScreen };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6', // Matching Investment Page background
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#F4F9F6', // Matching background
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircleHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D523B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    elevation: 6,
    shadowColor: '#0D523B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  avatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D523B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameBlock: {
    justifyContent: 'center',
  },
  greetingTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  investmentCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  investmentTop: {
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
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  splitCard: {
    width: '48%',
    padding: 20,
    borderRadius: 24,
  },
  splitIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: '23%',
    alignItems: 'center',
  },
  quickIconBox: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  txList: {
    gap: 8,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
  },
  slidingPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pillTabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  pillTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  partnershipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  partnershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  partnershipDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
