import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon, IconName } from '../AppIcon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'alert' | 'ghost';

export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'small' | 'medium' | 'large';
  gradientColors?: [string, string] | readonly [string, string] | string[];
  buttonColor?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  size = 'medium',
  gradientColors,
  buttonColor,
}) => {
  const { colors, roleTheme, typography, radius } = useAppTheme();

  const getGradientColors = (): string[] => {
    if (disabled) return [colors.textMuted, colors.borderStrong];
    if (gradientColors && gradientColors.length >= 2) {
      return [...gradientColors];
    }
    if (buttonColor) {
      return [buttonColor, buttonColor];
    }
    switch (variant) {
      case 'alert':
        return [colors.alertGradientStart || colors.error, colors.alertGradientEnd || colors.errorDark];
      case 'secondary':
        return [colors.secondary, colors.textSecondary];
      case 'primary':
      default:
        return [
          colors.gradientStart || roleTheme?.gradient?.[0] || colors.primary,
          colors.gradientEnd || roleTheme?.gradient?.[1] || colors.primaryLight,
        ];
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 38;
      case 'large':
        return 54;
      case 'medium':
      default:
        return 48;
    }
  };

  const isGradient = variant === 'primary' || variant === 'alert' || variant === 'secondary' || !!gradientColors;

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? (buttonColor || colors.primary) : colors.white}
        />
      );
    }

    const iconColor =
      variant === 'outline' || variant === 'ghost'
        ? (buttonColor || colors.primary)
        : colors.white;

    return (
      <View style={styles.innerRow}>
        {icon && iconPosition === 'left' && (
          <AppIcon name={icon} size={18} color={iconColor} style={styles.leftIcon} />
        )}
        <Text
          style={[
            typography.button,
            {
              color:
                variant === 'outline'
                  ? (buttonColor || colors.primary)
                  : variant === 'ghost'
                  ? colors.textSecondary
                  : colors.white,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <AppIcon name={icon} size={18} color={iconColor} style={styles.rightIcon} />
        )}
      </View>
    );
  };

  if (isGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.85}
        style={[styles.wrapper, { borderRadius: radius.full, height: getHeight() }, style]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { borderRadius: radius.full, height: getHeight() }]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      style={[
        styles.solidButton,
        {
          borderRadius: radius.full,
          height: getHeight(),
          borderColor: variant === 'outline' ? (buttonColor || colors.primary) : colors.transparent,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          backgroundColor: variant === 'ghost' ? colors.transparent : (buttonColor || colors.surfaceMuted),
        },
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  solidButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
