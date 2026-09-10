import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { Badge } from '../../component/Common/Badge';
import { AppIcon, IconName } from '../../component/AppIcon';
import { CustomButton } from '../../component/Common/CustomButton';
import { Skeleton } from '../../component/Common/Skeleton';
import { logoutThunk } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';

export const InvestorProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { colors, typography, radius } = useAppTheme();
  const user = useAppSelector(state => state.auth.user);
  const investor = useAppSelector(state => state.investor);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const menuItems: { id: string; title: string; icon: IconName; route?: string; isLogout?: boolean }[] = [
    { id: 'wallet', title: 'Investor Wallet & Withdrawals', icon: 'wallet', route: ROUTES.INVESTOR_WALLET },
    { id: 'agreement', title: 'Investment Agreement & Terms', icon: 'file-text' },
    { id: 'bank', title: 'Bank Account Details', icon: 'credit-card' },
    { id: 'tax', title: 'TDS & Tax Deduction Certificates', icon: 'file' },
    { id: 'password', title: 'Change Password', icon: 'lock' },
    { id: 'support', title: 'Investor Relations & Support', icon: 'help-circle' },
    { id: 'logout', title: 'Logout', icon: 'logout', isLogout: true },
  ];

  const handleMenuPress = (item: typeof menuItems[0]) => {
    if (item.isLogout) {
      dispatch(logoutThunk());
      dispatch(
        showToast({
          type: 'info',
          title: 'Logged Out',
          message: 'Investor session ended.',
        })
      );
    } else if (item.route) {
      navigation.navigate(item.route);
    } else {
      setActiveModal(item.id);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Investor Profile" showBack={false} showNotification={true} />

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
            <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={350} borderRadius={16} />
          </View>
        ) : (
          <>
            {/* Investor Info Card */}
            <Card style={styles.userCard} variant="flat" padding={18}>
              <View style={styles.userInfoRow}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.primarySoft }]}>
                  <AppIcon name="user" size={32} color={colors.primary} />
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.nameBadgeRow}>
                    <Text style={[typography.h3, { color: colors.textPrimary, flex: 1 }]}>
                      {user?.name || 'Ravi Chandran'}
                    </Text>
                    <Badge status="Active" label="Investor" size="small" />
                  </View>
                  <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 4 }]}>
                    {user?.phone || '+91 94432 99887'}
                  </Text>
                  <Text style={[typography.caption, { color: colors.primary, marginTop: 2, fontWeight: '600' }]}>
                    Investor ID: INV-003 • Agreement: {investor.details.agreementDate}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Investment Portfolio Summary */}
            <Card style={styles.summaryCard} variant="flat" padding={16}>
              <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: 12, fontWeight: '700' }]}>
                Investment Portfolio Summary
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Principal Amount</Text>
                  <Text style={[typography.h4, { color: colors.primary, fontWeight: '800', marginTop: 2 }]}>
                    {formatINR(investor.details.totalInvestment)}
                  </Text>
                </View>

                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

                <View style={styles.statBox}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Monthly Payout</Text>
                  <Text style={[typography.h4, { color: colors.primary, fontWeight: '800', marginTop: 2 }]}>
                    + ₹ 10,000
                  </Text>
                </View>

                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

                <View style={styles.statBox}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Wallet Balance</Text>
                  <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: '800', marginTop: 2 }]}>
                    {formatINR(investor.details.walletBalance)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Linked Bank Card */}
            <Card style={[styles.bankCard, { borderColor: colors.border }]} variant="flat" padding={14}>
              <View style={styles.bankRow}>
                <View style={styles.bankLeft}>
                  <View style={[styles.bankIconCircle, { backgroundColor: colors.primarySoft }]}>
                    <AppIcon name="credit-card" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[typography.h4, { color: colors.textPrimary }]}>
                      HDFC Bank •••• 4390
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                      Primary Settlement Account • IFSC: HDFC0001234
                    </Text>
                  </View>
                </View>
                <Badge status="Verified" size="small" />
              </View>
            </Card>

            {/* Menu Items */}
            <Card style={styles.menuCard} variant="flat" padding={6}>
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
                        <View
                          style={[
                            styles.menuIconCircle,
                            { backgroundColor: item.isLogout ? colors.errorLight : colors.primarySoft },
                          ]}
                        >
                          <AppIcon
                            name={item.icon}
                            size={18}
                            color={item.isLogout ? colors.error : colors.primary}
                          />
                        </View>
                        <Text
                          style={[
                            typography.subtitle,
                            {
                              color: item.isLogout ? colors.errorText : colors.textPrimary,
                              fontWeight: item.isLogout ? '700' : '500',
                            },
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>

                      {!item.isLogout && (
                        <AppIcon name="chevron-right" size={18} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>

                    {!isLast && <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />}
                  </React.Fragment>
                );
              })}
            </Card>

            <View style={styles.versionContainer}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Punnaigai Investor Portal v1.0.0
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Info Modal */}
      <Modal visible={!!activeModal} transparent animationType="fade">
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalCard, { borderRadius: radius.xl, backgroundColor: colors.surface }]}>
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 12 }]}>
              {activeModal === 'agreement'
                ? 'Investment Agreement'
                : activeModal === 'bank'
                ? 'Bank Account Details'
                : activeModal === 'tax'
                ? 'TDS & Tax Information'
                : activeModal === 'password'
                ? 'Change Password'
                : 'Investor Support'}
            </Text>

            {activeModal === 'agreement' && (
              <View style={{ gap: 8, marginBottom: 16 }}>
                <Text style={typography.bodyMedium}>Agreement Ref: AGR-INV-2023-003</Text>
                <Text style={typography.bodyMedium}>Principal: {formatINR(investor.details.totalInvestment)}</Text>
                <Text style={typography.bodyMedium}>Fixed Monthly Return: 2% (₹ 10,000/mo)</Text>
                <Text style={typography.bodyMedium}>Tenure: 24 Months (Expires Aug 2025)</Text>
              </View>
            )}

            {activeModal === 'tax' && (
              <View style={{ gap: 8, marginBottom: 16 }}>
                <Text style={typography.bodyMedium}>PAN: ABCPR1234F (Verified)</Text>
                <Text style={typography.bodyMedium}>TDS Rate: 10% under Section 194A</Text>
                <Text style={typography.bodyMedium}>Form 16A available for download on FY end</Text>
              </View>
            )}

            {activeModal === 'support' && (
              <View style={{ gap: 8, marginBottom: 16 }}>
                <Text style={typography.bodyMedium}>Investor Relations Desk: +91 427 244 8899</Text>
                <Text style={typography.bodyMedium}>Direct Email: investors@punnaigaifinances.com</Text>
              </View>
            )}

            <CustomButton
              title="Close"
              variant="primary"
              onPress={() => setActiveModal(null)}
              gradientColors={colors.buttonGradient}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    marginBottom: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  bankCard: {
    marginBottom: 16,
    borderWidth: 1,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuCard: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 12,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
  },
});
