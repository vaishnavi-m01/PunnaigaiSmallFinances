import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../hooks/useAppHooks';
import { hideToast } from '../store/toastSlice';
import { AppIcon, IconName } from './AppIcon';

/**
 * Global Toast Component
 * Highly visible toast with solid background colors for distinct states.
 */
export const GlobalToast: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { visible, type, title, message, duration } = useAppSelector(state => state.toast);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 10,
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
            toValue: -100,
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
          bg: '#10B981',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(255,255,255,0.2)',
          textColor: '#FFFFFF',
        };
      case 'error':
        return {
          icon: 'alert-circle' as IconName,
          bg: '#EF4444',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(255,255,255,0.2)',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          icon: 'alert-triangle' as IconName,
          bg: '#F59E0B',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(255,255,255,0.2)',
          textColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          icon: 'info' as IconName,
          bg: '#0F172A',
          iconColor: '#FFFFFF',
          badgeBg: 'rgba(255,255,255,0.2)',
          textColor: '#FFFFFF',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: Math.max(insets.top + 16, 32),
          backgroundColor: config.bg,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: config.badgeBg }]}>
        <AppIcon name={config.icon} size={20} color={config.iconColor} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.titleText, { color: config.textColor }]}>{title}</Text>
        {message ? (
          <Text style={[styles.messageText, { color: config.textColor, opacity: 0.9 }]}>
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
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  messageText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
  },
});

