import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon, IconName } from '../../component/AppIcon';
import { CustomButton } from '../../component/Common/CustomButton';
import { Skeleton } from '../../component/Common/Skeleton';
import { logoutThunk } from '../../store/authSlice';
import { fetchAssignedCustomersThunk } from '../../features/agent/collectionThunks';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';


export const AgentProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { colors, typography } = useAppTheme();
  const user = useAppSelector(state => state.auth.user);
  const agent = useAppSelector(state => state.agent);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchAssignedCustomersThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const profileName = user?.name || 'Agent User';
  const profileMobile = user?.phone || '+91 90000 00000';
  const agentCode = user?.id ? `AGT-${user.id}` : 'AGT-XXXX';

  const menuItems: { id: string; title: string; subtitle: string; icon: IconName; route?: string; }[] = [
    { id: 'reports', title: 'Performance Reports', subtitle: 'View daily & monthly stats', icon: 'trending-up' },
    { id: 'branch', title: 'Branch & Territory Info', subtitle: 'Your assigned work area', icon: 'home' },
    { id: 'password', title: 'Change Password', subtitle: 'Update login credentials', icon: 'lock' },
    { id: 'support', title: 'Help & Admin Support', subtitle: 'Contact regional manager', icon: 'help-circle' },
  ];

  const handleMenuPress = (item: typeof menuItems[0]) => {
    if (item.route) {
      navigation.navigate(item.route);
    } else {
      setActiveModal(item.id);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Profile" showBack={false} showNotification={true} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0D523B" />
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
            <Skeleton height={300} borderRadius={16} style={{ marginBottom: 24 }} />
          </View>
        ) : (
          <>
            {/* Top Profile Header Card */}
            <LinearGradient
              colors={['#047857', '#064E3B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userHeaderCard}
            >
              <View style={styles.userHeaderLeft}>
                <View style={[styles.avatarCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFFFFF' }}>{profileName.charAt(0)}</Text>
                </View>
                <View style={styles.userInfoCol}>
                  <Text style={[styles.profileName, { color: '#FFFFFF' }]}>{profileName}</Text>
                  <Text style={[styles.profilePhone, { color: 'rgba(255,255,255,0.8)' }]}>{profileMobile}</Text>
                  <View style={styles.userMetaRow}>
                    <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                      <AppIcon name="check-circle" size={12} color="#FFFFFF" />
                      <Text style={[styles.verifiedBadgeText, { color: '#FFFFFF' }]}>Active Agent</Text>
                    </View>
                    <Text style={[styles.agentIdText, { color: 'rgba(255,255,255,0.7)' }]}>ID: {agentCode}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* 3 Account Highlights Stat Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>-</Text>
                <Text style={styles.statLabel}>Main Branch</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>₹0</Text>
                <Text style={styles.statLabel}>Daily Target</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, styles.greenText]}>
                  {formatINR(agent.todayCollection || 0)}
                </Text>
                <Text style={styles.statLabel}>Collected</Text>
              </View>
            </View>

            {/* Section: Agent Settings */}
            <Text style={styles.sectionTitle}>Agent Settings</Text>
            <View style={styles.menuCard}>
              {menuItems.map((item, index) => {
                const isLast = index === menuItems.length - 1;
                return (
                  <React.Fragment key={item.id}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMenuPress(item)}
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
              <Text style={styles.footerVersionText}>Agent App • Version 2.1.0</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Info Modals */}
      <Modal visible={!!activeModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>
              {activeModal === 'reports'
                ? 'Performance Reports'
                : activeModal === 'branch'
                ? 'Branch Info'
                : activeModal === 'password'
                ? 'Change Password'
                : 'Help & Admin Support'}
            </Text>

            {activeModal === 'reports' && (
              <View style={styles.modalContentBlock}>
                <Text style={styles.modalItemText}>Daily Target: ₹ 0</Text>
                <Text style={[styles.modalItemText, { color: '#0D523B' }]}>
                  Achieved Today: {formatINR(agent.todayCollection || 0)}
                </Text>
                <Text style={styles.modalSubText}>
                  Keep up the good work! You are currently on track to hit your monthly targets.
                </Text>
              </View>
            )}

            {activeModal === 'branch' && (
              <View style={styles.modalContentBlock}>
                <Text style={styles.modalItemText}>Branch: Not Assigned</Text>
                <Text style={styles.modalItemText}>Territory: Not Assigned</Text>
                <Text style={styles.modalItemText}>Supervisor: Regional Manager</Text>
              </View>
            )}

            {activeModal === 'password' && (
              <View style={styles.modalContentBlock}>
                <Text style={styles.modalSubText}>
                  To change your password, please contact your regional manager or the admin desk to receive a reset link.
                </Text>
              </View>
            )}

            {activeModal === 'support' && (
              <View style={styles.modalContentBlock}>
                <Text style={styles.modalSubText}>Admin Desk: +91 427 244 5566</Text>
                <Text style={styles.modalSubText}>Email: admin@punnaigaifinances.com</Text>
                <Text style={styles.modalSubText}>Available Mon - Sat (9:00 AM - 6:00 PM)</Text>
              </View>
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
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  userHeaderCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  agentIdText: {
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
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
});
