import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppRoleType } from '../constants/roles';
import { useAppSelector } from '../hooks/useAppHooks';
import { useAppTheme } from '../theme/useAppTheme';

export interface RoleAccessFallbackProps {
  requiredRoles: readonly AppRoleType[];
  currentRole: AppRoleType | null;
}

export interface WithRoleAccessOptions {
  displayName?: string;
  fallback?: React.ComponentType<RoleAccessFallbackProps> | React.ReactNode;
}

const DefaultAccessDenied: React.FC<RoleAccessFallbackProps> = ({
  requiredRoles,
}) => {
  const { colors, typography } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.h2, styles.title, { color: colors.textPrimary }]}>
        Access Denied
      </Text>
      <Text style={[typography.bodyMedium, styles.message, { color: colors.textSecondary }]}>
        This section is not available for your current account role.
      </Text>
      <Text style={[typography.caption, styles.roles, { color: colors.textMuted }]}>
        Authorized Role(s): {requiredRoles.join(', ')}
      </Text>
    </View>
  );
};

export function useHasRole(allowedRoles: readonly AppRoleType[]) {
  const user = useAppSelector(state => state.auth.user);
  const role = user?.role || null;
  return {
    role,
    isAllowed: role !== null && allowedRoles.includes(role),
  };
}

export function withRoleAccess<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: readonly AppRoleType[],
  options: WithRoleAccessOptions = {}
): React.FC<P> {
  const RoleProtectedComponent: React.FC<P> = props => {
    const { role, isAllowed } = useHasRole(allowedRoles);

    if (!isAllowed) {
      if (typeof options.fallback === 'function') {
        const Fallback = options.fallback as React.ComponentType<RoleAccessFallbackProps>;
        return <Fallback requiredRoles={allowedRoles} currentRole={role} />;
      }

      return (
        options.fallback ?? (
          <DefaultAccessDenied requiredRoles={allowedRoles} currentRole={role} />
        )
      );
    }

    return <Component {...props} />;
  };

  RoleProtectedComponent.displayName =
    options.displayName ||
    `withRoleAccess(${Component.displayName || Component.name || 'Component'})`;

  return RoleProtectedComponent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontWeight: '700',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
  roles: {
    marginTop: 12,
    textAlign: 'center',
  },
});
