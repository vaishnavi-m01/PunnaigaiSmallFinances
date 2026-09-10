import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'circular' | 'rectangular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  style,
  variant = 'rectangular',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'circular':
        return {
          width: width || 40,
          height: height || width || 40,
          borderRadius: typeof width === 'number' ? width / 2 : 20,
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || 16,
          borderRadius: borderRadius ?? 4,
          marginBottom: 8,
        };
      case 'rectangular':
      default:
        return {
          width: width || '100%',
          height: height || 100,
          borderRadius: borderRadius ?? 8,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        getVariantStyle(),
        { opacity },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0', 
    overflow: 'hidden',
  },
});
