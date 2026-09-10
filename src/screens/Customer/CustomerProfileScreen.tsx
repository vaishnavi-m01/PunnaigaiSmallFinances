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
import { Header } from '../../component/Header';
import { AppIcon, IconName } from '../../component/AppIcon';
import { logout } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import { CustomButton } from '../../component/Common/CustomButton';
import { Skeleton } from '../../component/Common/Skeleton';
import { ROUTES } from '../../constants/routes';


export const CustomerProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const loan = useAppSelector(state => state.customer.loan);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const loanMenuItems: { id: string; title: string; subtitle: string; icon: IconName; route: string }[] = [
    {
      id: 'history',
      title: 'Payment History',
      subtitle: 'View all transactions & receipts',
      icon: 'credit-card',
      route: ROUTES.PAYMENT_HISTORY,
    },
    {
      id: 'schedule',
      title: 'Payment Schedule',
      subtitle: 'Upcoming EMI due dates',
      icon: 'calendar',
      route: ROUTES.PAYMENT_SCHEDULE,
    },
    {
      id: 'documents',
      title: 'My Documents',
      subtitle: 'Aadhaar, PAN & Bank proofs',
      icon: 'upload',
      route: ROUTES.MY_DOCUMENTS,
    },
  ];

  const accountMenuItems: { id: string; title: string; subtitle: string; icon: IconName }[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Name, mobile number & KYC details',
      icon: 'user',
    },
    {
      id: 'password',
      title: 'Change Password',
      subtitle: 'Update login credentials & PIN',
      icon: 'lock',
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: '24x7 Customer assistance & FAQ',
      icon: 'help-circle',
    },
    {
      id: 'about',
      title: 'About Us',
      subtitle: 'App version, terms & privacy',
      icon: 'info',
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    dispatch(
      showToast({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been logged out successfully.',
      })
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
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 16 }}>
            <Skeleton height={100} borderRadius={20} style={{ marginBottom: 24 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
              <Skeleton width="30%" height={80} borderRadius={16} />
              <Skeleton width="30%" height={80} borderRadius={16} />
              <Skeleton width="30%" height={80} borderRadius={16} />
            </View>
            <Skeleton height={24} width={150} style={{ marginBottom: 16 }} />
            <Skeleton height={180} borderRadius={16} style={{ marginBottom: 24 }} />
            <Skeleton height={24} width={150} style={{ marginBottom: 16 }} />
            <Skeleton height={240} borderRadius={16} style={{ marginBottom: 24 }} />
          </View>
        ) : (
          <>
            {/* Top Profile Header Card */}
            <View style={styles.userHeaderCard}>
              <View style={styles.userHeaderLeft}>
                <View style={styles.avatarCircle}>
                  <AppIcon name="user" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.userInfoCol}>
                  <Text style={styles.profileName}>
                    {user?.name || 'Raji Kumar'}
                  </Text>
                  <Text style={styles.profilePhone}>
                    {user?.phone || '+91 98765 43210'}
                  </Text>
                  <View style={styles.userMetaRow}>
                    <View style={styles.verifiedBadge}>
                      <AppIcon name="check-circle" size={11} color="#0D523B" />
                      <Text style={styles.verifiedBadgeText}>Verified Customer</Text>
                    </View>
                    <Text style={styles.customerIdText}>ID: {loan.loanId || 'PLN000123'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3 Account Highlights Stat Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>1 Loan</Text>
                <Text style={styles.statLabel}>Active Loan</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>₹ 1,00,000</Text>
                <Text style={styles.statLabel}>Total Borrowed</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[styles.statValue, styles.greenText]}>Verified</Text>
                <Text style={styles.statLabel}>KYC Status</Text>
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
                          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
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
                      onPress={() => setActiveModal(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuLeft}>
                        <View style={styles.menuIconCircle}>
                          <AppIcon name={item.icon} size={16} color="#0D523B" />
                        </View>
                        <View style={styles.menuTextCol}>
                          <Text style={styles.menuTitle}>{item.title}</Text>
                          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
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
                  <Text style={styles.logoutSubText}>Sign out of your account</Text>
                </View>
              </View>
              <AppIcon name="chevron-right" size={16} color="#EF4444" />
            </TouchableOpacity>

            {/* App Version Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerBrandText}>Punnaigai Small Finances Ltd.</Text>
              <Text style={styles.footerVersionText}>Version 1.0.4 • 100% Safe & Secure</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Info Modals */}
      <Modal visible={!!activeModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>
              {activeModal === 'personal'
                ? 'Personal Information'
                : activeModal === 'password'
                ? 'Change Password'
                : activeModal === 'support'
                ? 'Help & Support'
                : 'About Punnaigai Finances'}
            </Text>

            {activeModal === 'personal' && (
              <View style={styles.modalContentBlock}>
                <Text style={styles.modalItemText}>Full Name: {user?.name || 'Raji Kumar'}</Text>
                <Text style={styles.modalItemText}>Phone: {user?.phone || '+91 98765 43210'}</Text>
                <Text style={styles.modalItemText}>Loan Account: Active</Text>
                <Text style={styles.modalItemText}>KYC Status: Verified (Aadhaar & PAN)</Text>
              </View>
            )}

            {activeModal === 'password' && (
              <View style={styles.modalContentBlock}>
                <Text style={styles.modalSubText}>
                  To change your password or transaction PIN, an OTP will be dispatched to your registered phone number (+91 98765 43210).
                </Text>
              </View>
            )}

            {activeModal === 'support' && (
              <View style={styles.modalContentBlock}>
                <Text style={styles.modalSubText}>Toll-free: 1800-123-PUNNAIGAI (7866)</Text>
                <Text style={styles.modalSubText}>Email: support@punnaigaifinances.com</Text>
                <Text style={styles.modalSubText}>Support Hours: Mon - Sat (9:00 AM - 6:00 PM)</Text>
              </View>
            )}

            {activeModal === 'about' && (
              <Text style={styles.modalAboutText}>
                Punnaigai Small Finances provides reliable, transparent, and digitally-enabled microfinance and loan solutions across India.
              </Text>
            )}

            <CustomButton
              title="Close"
              variant="primary"
              onPress={() => setActiveModal(null)}
              gradientColors={['#168A53', '#0D523B']}
            />
          </View>
        </View>
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
});
