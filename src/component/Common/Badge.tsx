import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

export type BadgeStatus =
  | 'Active'
  | 'Paid'
  | 'Pending'
  | 'Overdue'
  | 'Verified'
  | 'Not Uploaded'
  | 'Rejected'
  | 'Completed'
  | 'Credited';

interface BadgeProps {
  status: BadgeStatus | string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  style,
  textStyle,
  size = 'medium',
}) => {
  const { colors, typography, radius } = useAppTheme();

  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
      case 'paid':
      case 'completed':
      case 'credited':
        return {
          bg: colors.primarySoft,
          text: colors.primary,
          border: colors.borderGreen,
        };
      case 'pending':
        return {
          bg: colors.warningLight,
          text: colors.warningText,
          border: colors.warningBorder,
        };
      case 'overdue':
      case 'rejected':
        return {
          bg: colors.errorLight,
          text: colors.errorText,
          border: colors.errorBorder,
        };
      case 'not uploaded':
        return {
          bg: colors.surfaceMuted,
          text: colors.textLight,
          border: colors.border,
        };
      default:
        return {
          bg: colors.surfaceMuted,
          text: colors.textSecondary,
          border: colors.border,
        };
    }
  };

  const badgeColors = getColors();
  const displayLabel = label || status;
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          borderRadius: radius.full,
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          typography.badge,
          {
            color: badgeColors.text,
            fontSize: isSmall ? 10 : 12,
            fontWeight: '600',
          },
          textStyle,
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
