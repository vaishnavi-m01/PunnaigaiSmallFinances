import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat' | 'primarySoft';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 16,
}) => {
  const { colors, radius } = useAppTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primarySoft':
        return {
          backgroundColor: colors.primaryBackground,
          borderWidth: 1,
          borderColor: colors.borderGreen,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderGreen,
        };
      case 'flat':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          ...Platform.select({
            ios: {
              shadowColor: colors.primaryDark,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            },
            android: {
              elevation: 2,
            },
          }),
        };
    }
  };

  const cardStyle = [
    styles.card,
    {
      borderRadius: radius.lg,
      padding,
    },
    getVariantStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    overflow: 'visible',
  },
});
