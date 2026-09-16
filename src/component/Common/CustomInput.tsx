import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon, IconName } from '../AppIcon';

interface CustomInputProps extends TextInputProps {
  label?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  error,
  containerStyle,
  style,
  ...rest
}) => {
  const { colors, typography, radius } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecured = isPassword && !showPassword;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, typography.subtitle, { color: colors.textPrimary }]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderRadius: radius.md,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.primary
              : colors.border,
            backgroundColor: colors.surface,
            height: rest.multiline ? undefined : 50,
            minHeight: rest.multiline ? 100 : 50,
            alignItems: rest.multiline ? 'flex-start' : 'center',
            paddingVertical: rest.multiline ? 12 : 0,
          },
        ]}
      >
        {leftIcon && (
          <AppIcon
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary : colors.textMuted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.textInput,
            typography.bodyMedium,
            { color: colors.textPrimary },
            rest.multiline && { textAlignVertical: 'top' },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecured}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppIcon
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            <AppIcon name={rightIcon} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.errorText, typography.caption, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
  },
  inputContainer: {
    height: 50,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  errorText: {
    marginTop: 4,
  },
});
