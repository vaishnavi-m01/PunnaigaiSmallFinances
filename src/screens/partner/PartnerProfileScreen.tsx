import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { logoutThunk } from '../../store/authSlice';
import { fetchPartnerProfileThunk } from '../../store/partnerSlice';
import { Skeleton } from '../../component/Common/Skeleton';
import { useTranslation } from '../../context/LanguageContext';

export const PartnerProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const user = useAppSelector(state => state.auth.user);
  const partner = useAppSelector(state => state.partner);
  const dispatch = useAppDispatch();
  const { t, language, setLanguage } = useTranslation();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchPartnerProfileThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchPartnerProfileThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const name = partner.profile?.name || user?.name?.split(' ')[0] || 'Partner';

  const handleLogout = () => {
    Alert.alert(
      t('Confirm Logout') || 'Confirm Logout',
      t('Are you sure you want to log out of your account?') ||
        'Are you sure you want to log out of your account?',
      [
        { text: t('Cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('Log Out') || 'Log Out',
          style: 'destructive',
          onPress: () => dispatch(logoutThunk()),
        },
      ],
      { cancelable: true },
    );
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header title={t('Profile')} showBack={false} />

      <View style={styles.content}>
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
            <View>
              <View style={[styles.profileRow, { marginBottom: 32 }]}>
                <Skeleton height={52} width={52} borderRadius={26} />
                <View style={{ marginLeft: 16 }}>
                  <Skeleton
                    height={24}
                    width={150}
                    borderRadius={8}
                    style={{ marginBottom: 8 }}
                  />
                  <Skeleton height={16} width={80} borderRadius={8} />
                </View>
              </View>
              <Skeleton
                height={180}
                borderRadius={16}
                style={{ marginBottom: 16 }}
              />
              <Skeleton
                height={180}
                borderRadius={16}
                style={{ marginBottom: 16 }}
              />
              <Skeleton
                height={100}
                borderRadius={16}
                style={{ marginBottom: 16 }}
              />
            </View>
          ) : (
            <>
              {/* Profile Header */}
              <View style={styles.profileRow}>
                <View
                  style={[styles.avatarCircle, { backgroundColor: '#10B981' }]}
                >
                  <Text style={[typography.h3, { color: colors.white }]}>
                    {name.charAt(0)}
                  </Text>
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={[typography.h3, { color: '#0F172A' }]}>
                    {name}
                  </Text>
                  <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                    Partner
                  </Text>
                </View>
              </View>

              {/* Investment Summary */}
              <View style={[styles.card, { backgroundColor: colors.white }]}>
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.smallIconCircle,
                      { backgroundColor: '#E0F2FE' },
                    ]}
                  >
                    <AppIcon name="briefcase" size={14} color="#0284C7" />
                  </View>
                  <Text
                    style={[
                      typography.subtitle,
                      { color: '#0F172A', marginLeft: 8 },
                    ]}
                  >
                    {t('Investment Summary') || 'Investment Summary'}
                  </Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.dataRow}>
                  <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                    {t('Total Investment') || 'Total Investment'}
                  </Text>
                  <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                    {formatINR(
                      partner.profile?.investment_summary?.total_investment ||
                        0,
                    )}
                  </Text>
                </View>
                {/* <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>{t('Remaining Investment') || 'Remaining Investment'}</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(partner.profile?.investment_summary?.remaining_investment || 0)}
              </Text>
            </View> */}
              </View>

              {/* Profit Summary */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: '#FFF5F5', borderColor: '#FEE2E2' },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.smallIconCircle,
                      { backgroundColor: '#FEE2E2' },
                    ]}
                  >
                    <AppIcon name="pie-chart" size={14} color="#EF4444" />
                  </View>
                  <Text
                    style={[
                      typography.subtitle,
                      { color: '#EF4444', marginLeft: 8 },
                    ]}
                  >
                    {t('Profit Summary') || 'Profit Summary'}
                  </Text>
                </View>
                <View
                  style={[styles.divider, { backgroundColor: '#FEE2E2' }]}
                />

                <View
                  style={[
                    styles.dataRow,
                    { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
                  ]}
                >
                  <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                    {t('Total Profit Earned') || 'Total Profit Earned'}
                  </Text>
                  <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                    {formatINR(
                      partner.profile?.profit_summary?.total_profit_earned || 0,
                    )}
                  </Text>
                </View>
              </View>

              {/* Wallet Balance */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE' },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.smallIconCircle,
                      { backgroundColor: '#EDE9FE' },
                    ]}
                  >
                    <AppIcon name="credit-card" size={14} color="#8B5CF6" />
                  </View>
                  <Text
                    style={[
                      typography.subtitle,
                      { color: '#8B5CF6', marginLeft: 8 },
                    ]}
                  >
                    {t('Wallet Balance') || 'Wallet Balance'}
                  </Text>
                </View>
                <View
                  style={[styles.divider, { backgroundColor: '#EDE9FE' }]}
                />

                <View
                  style={[
                    styles.dataRow,
                    { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
                  ]}
                >
                  <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                    {t('Total Wallet Balance') || 'Total Wallet Balance'}
                  </Text>
                  <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                    {formatINR(partner.profile?.wallet_balance || 0)}
                  </Text>
                </View>
              </View>

              {/* Language Toggle */}
              <View
                style={[
                  styles.bottomBtn,
                  { backgroundColor: '#ECFDF5', marginBottom: 16 },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AppIcon
                    name="globe"
                    size={20}
                    color="#059669"
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={[
                      typography.subtitle,
                      { color: '#059669', fontWeight: '700' },
                    ]}
                  >
                    {t('Language')} : {language === 'en' ? 'English' : 'தமிழ்'}
                  </Text>
                </View>
                <Switch
                  value={language === 'ta'}
                  onValueChange={toggleLanguage}
                  trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                  thumbColor={language === 'ta' ? '#059669' : '#F3F4F6'}
                />
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={[
                  styles.bottomBtn,
                  {
                    backgroundColor: '#FEF2F2',
                    position: 'relative',
                    justifyContent: 'center',
                  },
                ]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    typography.subtitle,
                    { color: '#EF4444', fontWeight: '700' },
                  ]}
                >
                  {t('Logout')}
                </Text>
                <View style={{ position: 'absolute', right: 20 }}>
                  <AppIcon name="log-out" size={20} color="#EF4444" />
                </View>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
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
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Make room for sticky bottom
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  bottomBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
});
