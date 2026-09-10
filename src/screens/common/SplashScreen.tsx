import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import { AppIcon } from '../../component/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(ROUTES.LOGIN);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[colors.splashGradient[0], colors.splashGradient[1], colors.splashGradient[2]]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        {/* Leaf Emblem & Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
            <AppIcon name="leaf" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.brandTitle, { color: colors.white }]}>PUNNAIGAI</Text>
          <Text style={[styles.brandSubtitle, { color: colors.borderGreen }]}>FINANCES</Text>
          <Text style={[styles.tagline, { color: colors.primarySoft }]}>Your Growth Our Priority</Text>
        </View>

        {/* Center Tagline */}
        <View style={styles.centerTextContainer}>
          <Text style={[styles.heroText, { color: colors.primarySoft }]}>Small Steps</Text>
          <Text style={[styles.heroTextBold, { color: colors.white }]}>Big Dreams</Text>
        </View>
      </View>

      {/* Decorative Wave curves at bottom */}
      <View style={styles.waveContainer}>
        <Svg width={width} height={180} viewBox={`0 0 ${width} 180`} fill="none">
          <Path
            d={`M0 80 C ${width * 0.3} 140, ${width * 0.65} 20, ${width} 100 L ${width} 180 L 0 180 Z`}
            fill="rgba(32, 107, 107, 0.25)"
          />
          <Path
            d={`M0 110 C ${width * 0.35} 50, ${width * 0.7} 150, ${width} 80 L ${width} 180 L 0 180 Z`}
            fill="rgba(245, 158, 11, 0.2)"
          />
          <Path
            d={`M0 130 C ${width * 0.4} 100, ${width * 0.8} 170, ${width} 110 L ${width} 180 L 0 180 Z`}
            fill="rgba(255, 255, 255, 0.12)"
          />
        </Svg>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  centerTextContainer: {
    alignItems: 'center',
  },
  heroText: {
    fontSize: 22,
    fontWeight: '400',
  },
  heroTextBold: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
