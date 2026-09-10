import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  ViewStyle,
  StatusBarStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../theme/useAppTheme';

interface GradientScreenWrapperProps {
  children: React.ReactNode;
  gradientColors?: string[];
  isScrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  statusBarStyle?: StatusBarStyle;
  statusBarColor?: string;
  useGradientBackground?: boolean;
  edges?: readonly ('top' | 'right' | 'bottom' | 'left')[];
}

export const GradientScreenWrapper: React.FC<GradientScreenWrapperProps> = ({
  children,
  gradientColors,
  isScrollable = false,
  style,
  contentContainerStyle,
  statusBarStyle = 'dark-content',
  statusBarColor,
  useGradientBackground = false,
  edges = ['top', 'left', 'right'],
}) => {
  const { colors } = useAppTheme();
  const defaultGradient = [colors.heroGradient[0], colors.heroGradient[1], colors.heroGradient[2]];
  const activeGradient = gradientColors || defaultGradient;

  const content = isScrollable ? (
    <ScrollView
      style={[styles.fill, style]}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, style]}>{children}</View>
  );

  if (useGradientBackground) {
    return (
      <LinearGradient colors={activeGradient} style={styles.fill}>
        <StatusBar
          barStyle={statusBarStyle === 'dark-content' ? 'light-content' : statusBarStyle}
          {...(Platform.OS === 'android' ? { backgroundColor: 'transparent', translucent: true } : {})}
        />
        <SafeAreaView edges={edges} style={styles.fill}>
          {content}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.fill, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={statusBarStyle}
        {...(Platform.OS === 'android' ? { backgroundColor: statusBarColor || colors.surface } : {})}
      />
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
