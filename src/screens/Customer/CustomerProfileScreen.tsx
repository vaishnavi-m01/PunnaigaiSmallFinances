import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../component/Header';
import { AppIcon, IconName } from '../../component/AppIcon';
import { logoutThunk } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import { CustomButton } from '../../component/Common/CustomButton';
import { Skeleton } from '../../component/Common/Skeleton';
import { ROUTES } from '../../constants/routes';
import * as authApi from '../../services/api/authApi';
import { formatDate } from '../../utils/date';

export const CustomerProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [profile, setProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = React.useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const response = await authApi.getProfile();
      setProfile(
        response.profile ??
          response.user?.customer ??
          response.user ??
          response,
      );
    } catch {
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  }, [loadProfile]);

  const profileName = profile?.name || user?.name || 'Customer';
  const profileMobile = profile?.mobile || user?.phone || '';
  const profileEmail = profile?.email || user?.email || '';
  const customerCode = profile?.customer_code || '—';

  const loanMenuItems: {
    id: string;
    title: string;
    subtitle: string;
    icon: IconName;
    route: string;
  }[] = [
    {
      id: 'history',
      title: 'Payment History',
      subtitle: 'View all transactions & receipts',
      icon: 'credit-card',
      route: ROUTES.PAYMENT_SCHEDULE,
    },
    {
      id: 'schedule',
      title: 'Payment Schedule',
      subtitle: 'Upcoming EMI due dates',
      icon: 'calendar',
      route: ROUTES.LOAN_DETAILS,
    },
  ];

  const accountMenuItems: {
    id: string;
    title: string;
    subtitle: string;
    icon: IconName;
    route?: string;
  }[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Name, mobile number & KYC details',
      icon: 'user',
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: '24x7 Customer assistance & FAQ',
      icon: 'help-circle',
      route: ROUTES.HELP_AND_SUPPORT,
    },
    {
      id: 'about',
      title: 'About Us',
      subtitle: 'App version, terms & privacy',
      icon: 'info',
    },
  ];

  const handleLogout = () => {
    dispatch(logoutThunk());
    dispatch(
      showToast({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been logged out successfully.',
      }),
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="My Profile" showBack={false} showNotification={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      >
        {isRefreshing || isProfileLoading ? (
          <View style={{ paddingTop: 16 }}>
            <Skeleton
              height={100}
              borderRadius={20}
              style={{ marginBottom: 24 }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 32,
              }}
            >
            
            </View>
            <Skeleton height={24} width={150} style={{ marginBottom: 16 }} />
            <Skeleton
              height={180}
              borderRadius={16}
              style={{ marginBottom: 24 }}
            />
            <Skeleton height={24} width={150} style={{ marginBottom: 16 }} />
            <Skeleton
              height={240}
              borderRadius={16}
              style={{ marginBottom: 24 }}
            />
          </View>
        ) : (
          <>
            {/* Top Profile Header Card */}
            <View style={[styles.userHeaderCard, { marginTop: 16 }]}>
              <View style={styles.userHeaderLeft}>
                <View style={styles.avatarCircle}>
                  <AppIcon name="user" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.userInfoCol}>
                  <Text style={styles.profileName}>{profileName}</Text>
                  <Text style={styles.profilePhone}>{profileMobile}</Text>
                  <View style={styles.userMetaRow}>
                    <View style={styles.verifiedBadge}>
                      <AppIcon name="check-circle" size={11} color="#0D523B" />
                      <Text style={styles.verifiedBadgeText}>
                        Verified Customer
                      </Text>
                    </View>
                    <Text style={styles.customerIdText}>
                      Customer ID: {customerCode}
                    </Text>
                  </View>
                </View>
              </View>
            </View>


            {/* Section 1: Loans & Transactions */}
            <Text style={styles.sectionTitle}>Loans & Transactions</Text>
            <View style={styles.menuCard}>
              {loanMenuItems.map((item, index) => {
                const isLast = index === loanMenuItems.length - 1;
                return (
                  <React.Fragment key={item.id}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => navigation.navigate(item.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuLeft}>
                        <View style={styles.menuIconCircle}>
                          <AppIcon name={item.icon} size={16} color="#0D523B" />
                        </View>
                        <View style={styles.menuTextCol}>
                          <Text style={styles.menuTitle}>{item.title}</Text>
                          <Text style={styles.menuSubtitle}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>

                      <AppIcon name="chevron-right" size={16} color="#94A3B8" />
                    </TouchableOpacity>

                    {!isLast && <View style={styles.menuDivider} />}
                  </React.Fragment>
                );
              })}
            </View>

            {/* Section 2: Account & Support */}
            <Text style={styles.sectionTitle}>Account & Support</Text>
            <View style={styles.menuCard}>
              {accountMenuItems.map((item, index) => {
                const isLast = index === accountMenuItems.length - 1;
                return (
                  <React.Fragment key={item.id}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => item.route ? navigation.navigate(item.route) : setActiveModal(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuLeft}>
                        <View style={styles.menuIconCircle}>
                          <AppIcon name={item.icon} size={16} color="#0D523B" />
                        </View>
                        <View style={styles.menuTextCol}>
                          <Text style={styles.menuTitle}>{item.title}</Text>
                          <Text style={styles.menuSubtitle}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>

                      <AppIcon name="chevron-right" size={16} color="#94A3B8" />
                    </TouchableOpacity>

                    {!isLast && <View style={styles.menuDivider} />}
                  </React.Fragment>
                );
              })}
            </View>

            {/* Separate Soft Red Logout Box */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.logoutLeft}>
                <View style={styles.logoutIconCircle}>
                  <AppIcon name="logout" size={16} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.logoutText}>Logout</Text>
                  <Text style={styles.logoutSubText}>
                    Sign out of your account
                  </Text>
                </View>
              </View>
              <AppIcon name="chevron-right" size={16} color="#EF4444" />
            </TouchableOpacity>

            {/* App Version Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerBrandText}>
                Punnaigai Small Finances Ltd.
              </Text>
              <Text style={styles.footerVersionText}>
                Version 1.0.4 • 100% Safe & Secure
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Info Modals */}
      <Modal visible={activeModal === 'about'} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>About Punnaigai Finances</Text>

            <View>
              <Text style={styles.modalAboutText}>
                Punnaigai Small Finances provides reliable, transparent, and
                digitally-enabled microfinance and loan solutions across India.
              </Text>
              <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A' }}>App Version 1.0.4</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 4 }}>Build 204 (Latest)</Text>
              </View>
            </View>

            <CustomButton
              title="Close"
              variant="primary"
              onPress={() => setActiveModal(null)}
              gradientColors={['#168A53', '#0D523B']}
            />
          </View>
        </View>
      </Modal>

      {/* Personal Info Bottom Sheet */}
      <Modal visible={activeModal === 'personal'} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.bottomSheetBackdrop} 
          activeOpacity={1} 
          onPress={() => setActiveModal(null)}
        >
          <View style={styles.bottomSheetCard} onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHandle} />
            
            <View style={styles.bottomSheetHeaderRow}>
              <Text style={styles.bottomSheetTitle}>Personal Information</Text>
              <TouchableOpacity 
                onPress={() => setActiveModal(null)} 
                style={styles.closeIconButton}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{profileName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{profileMobile}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{profileEmail || 'Not provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>
                  {[profile?.address, profile?.city, profile?.state, profile?.pincode]
                    .filter(Boolean)
                    .join(', ') || 'Not provided'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{profile?.date_of_birth ? formatDate(profile.date_of_birth) : 'Not provided'}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Occupation</Text>
                <Text style={styles.infoValue}>{profile?.occupation || 'Not provided'}</Text>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  userHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
  },
  userHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D523B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    color: '#0F172A',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  profilePhone: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF5EE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: '#0D523B',
    fontSize: 10,
    fontWeight: '700',
  },
  customerIdText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  greenText: {
    color: '#0D523B',
  },
  sectionTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  menuSubtitle: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  logoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 13,
  },
  logoutSubText: {
    color: '#F87171',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerBrandText: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '700',
  },
  footerVersionText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalContentBlock: {
    gap: 8,
    marginBottom: 16,
  },
  modalItemText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
  modalAboutText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  closeIconButton: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  bottomSheetContent: {
    paddingBottom: 20,
  },
  infoRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});
