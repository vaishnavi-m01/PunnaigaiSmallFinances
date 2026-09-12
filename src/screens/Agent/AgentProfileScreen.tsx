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
import { AppIcon, IconName } from '../../component/AppIcon';
import { CustomButton } from '../../component/Common/CustomButton';
import { Skeleton } from '../../component/Common/Skeleton';
import { logoutThunk } from '../../store/authSlice';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';

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

export const AgentProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { colors, typography } = useAppTheme();
  const user = useAppSelector(state => state.auth.user);
  const agent = useAppSelector(state => state.agent);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const menuItems: { id: string; title: string; icon: IconName; route?: string; }[] = [
    { id: 'reports', title: 'Daily & Monthly Performance', icon: 'trending-up' },
    { id: 'branch', title: 'Branch & Territory Info', icon: 'home' },
    { id: 'password', title: 'Change Password', icon: 'lock' },
    { id: 'support', title: 'Help & Admin Support', icon: 'help-circle' },
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
    <View style={[styles.container, { backgroundColor: '#168B5E' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0B533E', '#168B5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}
      >
        <HeaderGraphic />
        <View style={styles.headerTitleRow}>
          <Text style={[typography.h3, { color: colors.white }]}>
            Profile
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.pageContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {isRefreshing ? (
            <View style={{ paddingTop: 8 }}>
              <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />
              <Skeleton height={150} borderRadius={16} style={{ marginBottom: 16 }} />
              <Skeleton height={350} borderRadius={16} />
            </View>
          ) : (
            <>
              {/* Agent Info Card */}
              <View style={[styles.profileCard, { backgroundColor: colors.white }]}>
                <View style={styles.profileHeaderRow}>
                  <View style={styles.profileLeft}>
                    <View style={[styles.avatarCircle, { backgroundColor: '#E0F2FE' }]}>
                      <Text style={[typography.h2, { color: '#0284C7' }]}>
                        {user?.name?.charAt(0) || 'A'}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 16 }}>
                      <Text style={[typography.h3, { color: '#0F172A' }]}>
                        {user?.name || 'Agent User'}
                      </Text>
                      <Text style={[typography.bodyMedium, { color: '#64748B', marginTop: 4 }]}>
                        {user?.phone || '+91 9000000000'}
                      </Text>
                      <View style={styles.locationRow}>
                        <AppIcon name="map-pin" size={12} color="#94A3B8" />
                        <Text style={[typography.caption, { color: '#64748B', marginLeft: 4 }]}>
                          Salem Branch
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[typography.caption, { color: '#16A34A' }]}>
                      Active
                    </Text>
                  </View>
                </View>
              </View>



              {/* Menu Items */}
              <View style={[styles.menuList, { backgroundColor: colors.white }]}>
                {menuItems.map((item, index) => {
                  const isLast = index === menuItems.length - 1;
                  return (
                    <View key={item.id}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuPress(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.menuLeft}>
                          <View
                            style={[
                              styles.menuIconCircle,
                              { backgroundColor: '#F8FAFC' },
                            ]}
                          >
                            <AppIcon
                              name={item.icon}
                              size={18}
                              color="#64748B"
                            />
                          </View>
                          <Text
                            style={[
                              typography.bodyLarge,
                              {
                                color: '#0F172A',
                                fontWeight: '500',
                              },
                            ]}
                          >
                            {item.title}
                          </Text>
                        </View>
                        <AppIcon name="chevron-right" size={20} color="#94A3B8" />
                      </TouchableOpacity>
                      {!isLast && <View style={[styles.menuDivider, { backgroundColor: '#F1F5F9' }]} />}
                    </View>
                  );
                })}
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={[styles.bottomBtn, { backgroundColor: '#FEF2F2', position: 'relative', justifyContent: 'center', marginTop: 24 }]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={[typography.subtitle, { color: '#EF4444', fontWeight: '700' }]}>
                  Log Out
                </Text>
                <View style={{ position: 'absolute', right: 20 }}>
                  <AppIcon name="log-out" size={20} color="#EF4444" />
                </View>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      {/* Info Modal */}
      <Modal visible={!!activeModal} transparent animationType="fade">
        <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 16 }]}>
              {activeModal === 'reports'
                ? 'Performance Reports'
                : activeModal === 'branch'
                ? 'Branch Info'
                : activeModal === 'password'
                ? 'Change Password'
                : 'Support'}
            </Text>

            {activeModal === 'reports' && (
              <View style={{ gap: 12, marginBottom: 24 }}>
                <View style={styles.modalRow}>
                  <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Daily Target</Text>
                  <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>₹ 50,000</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Achieved Today</Text>
                  <Text style={[typography.bodyLarge, { color: colors.success }]}>{formatINR(agent.todayCollection)}</Text>
                </View>
              </View>
            )}

            {activeModal === 'branch' && (
              <View style={{ gap: 12, marginBottom: 24 }}>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>Salem Main Branch</Text>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Territory: Salem South</Text>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>Supervisor: Regional Manager</Text>
              </View>
            )}

            {activeModal === 'support' && (
              <View style={{ gap: 12, marginBottom: 24 }}>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>Admin Desk</Text>
                <Text style={[typography.bodyMedium, { color: colors.primary }]}>+91 427 244 5566</Text>
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>admin@punnaigaifinances.com</Text>
              </View>
            )}

            <CustomButton
              title="Close"
              variant="primary"
              onPress={() => setActiveModal(null)}
              size="large"
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
  },
  header: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // For fixed bottom button
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  menuList: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  bottomBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
