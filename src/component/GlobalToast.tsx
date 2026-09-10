import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../hooks/useAppHooks';
import { hideToast } from '../store/toastSlice';
import { AppIcon, IconName } from './AppIcon';

/**
 * Global Toast Component
 * Clean, flat White card toast with colored icon badges and dark readable typography.
 */
export const GlobalToast: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { visible, type, title, message, duration } = useAppSelector(state => state.toast);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          dispatch(hideToast());
        });
      }, duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, dispatch, opacity, translateY]);

  if (!visible) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle' as IconName,
          iconColor: '#10B981',
          badgeBg: '#EAF5EE',
          borderColor: '#A7F3D0',
        };
      case 'error':
        return {
          icon: 'alert-circle' as IconName,
          iconColor: '#EF4444',
          badgeBg: '#FEE2E2',
          borderColor: '#FECACA',
        };
      case 'warning':
        return {
          icon: 'alert-triangle' as IconName,
          iconColor: '#F59E0B',
          badgeBg: '#FEF3C7',
          borderColor: '#FDE68A',
        };
      case 'info':
      default:
        return {
          icon: 'info' as IconName,
          iconColor: '#0284C7',
          badgeBg: '#E0F2FE',
          borderColor: '#BAE6FD',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: Math.max(insets.top + 8, 16),
          borderColor: config.borderColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Icon Badge */}
      <View style={[styles.iconCircle, { backgroundColor: config.badgeBg }]}>
        <AppIcon name={config.icon} size={18} color={config.iconColor} />
      </View>

      {/* Message Text */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        {message ? (
          <Text style={styles.messageText}>
            {message}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 9999,
    elevation: 0,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  messageText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
});

