import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { APP_ROLES, AppRoleType } from '../../constants/roles';
import { switchRole } from '../../store/authSlice';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../AppIcon';
import { roleColors } from '../../theme/roleColors';

export const RoleSwitcherModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentRole = useAppSelector(state => state.auth.user?.role) || APP_ROLES.CUSTOMER;
  const { colors, typography, radius } = useAppTheme();
  const [visible, setVisible] = useState(false);

  const rolesList: { role: AppRoleType; title: string; subtitle: string; icon: any }[] = [
    {
      role: APP_ROLES.CUSTOMER,
      title: 'Customer View',
      subtitle: 'Loans, schedules, payments & documents',
      icon: 'user',
    },
    {
      role: APP_ROLES.AGENT,
      title: 'Agent View',
      subtitle: 'Assigned customers, collections & reports',
      icon: 'users',
    },
    {
      role: APP_ROLES.INVESTOR,
      title: 'Investor View',
      subtitle: 'Investments, returns, wallet & withdrawals',
      icon: 'trending-up',
    },
    {
      role: APP_ROLES.PARTNERSHIP,
      title: 'Partner View',
      subtitle: 'Contributions, earnings & partnership wallet',
      icon: 'pie-chart',
    },
  ];

  const handleSelectRole = (role: AppRoleType) => {
    dispatch(switchRole(role));
    setVisible(false);
  };

  return (
    <>
      {/* Floating Role Switcher Trigger Button */}
      <TouchableOpacity
        style={[
          styles.floatingBtn,
          { backgroundColor: roleColors[currentRole]?.primary || colors.primary },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <AppIcon name="users" size={18} color={colors.white} />
        <Text style={[styles.floatingText, { color: colors.white }]}>
          Role: {roleColors[currentRole]?.roleName || 'Customer'}
        </Text>
      </TouchableOpacity>

      {/* Role Selection Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]} onPress={() => setVisible(false)}>
          <Pressable style={[styles.modalContent, { borderRadius: radius.xl, backgroundColor: colors.surface }]}>
            <View style={styles.headerRow}>
              <View>
                <Text style={[typography.h3, { color: colors.textPrimary }]}>Switch User Role</Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  Preview the complete role-based mobile interface
                </Text>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <AppIcon name="alert-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.rolesContainer}>
              {rolesList.map(item => {
                const isSelected = currentRole === item.role;
                const rTheme = roleColors[item.role];
                return (
                  <TouchableOpacity
                    key={item.role}
                    style={[
                      styles.roleCard,
                      {
                        borderRadius: radius.lg,
                        borderColor: isSelected ? rTheme.primary : colors.border,
                        backgroundColor: isSelected ? rTheme.soft : colors.surfaceSubtle,
                      },
                    ]}
                    onPress={() => handleSelectRole(item.role)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: isSelected ? rTheme.primary : colors.border },
                      ]}
                    >
                      <AppIcon
                        name={item.icon}
                        size={20}
                        color={isSelected ? colors.white : colors.textSecondary}
                      />
                    </View>

                    <View style={styles.roleInfo}>
                      <Text
                        style={[
                          typography.h4,
                          { color: isSelected ? rTheme.primaryDark : colors.textPrimary },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          typography.caption,
                          { color: isSelected ? rTheme.primaryDark : colors.textSecondary },
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: rTheme.primary }]}>
                        <AppIcon name="check" size={14} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingBtn: {
    position: 'absolute',
    bottom: 85,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    elevation: 6,
    zIndex: 999,
  },
  floatingText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    padding: 4,
  },
  rolesContainer: {
    gap: 10,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
