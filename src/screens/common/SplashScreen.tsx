import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Image,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  // ----- Animation Refs -----
  const logoScale    = useRef(new Animated.Value(0.3)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoRotate   = useRef(new Animated.Value(-0.05)).current;

  const ringScale1   = useRef(new Animated.Value(0.6)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringScale2   = useRef(new Animated.Value(0.6)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;

  const orbFloat1    = useRef(new Animated.Value(0)).current;
  const orbFloat2    = useRef(new Animated.Value(0)).current;
  const orbOpacity   = useRef(new Animated.Value(0)).current;

  const text1Opacity = useRef(new Animated.Value(0)).current;
  const text1Y       = useRef(new Animated.Value(24)).current;
  const text2Opacity = useRef(new Animated.Value(0)).current;
  const text2Y       = useRef(new Animated.Value(24)).current;
  const lineWidth    = useRef(new Animated.Value(0)).current;

  const shimmerX     = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    // ---- Entrance Sequence ----
    Animated.sequence([
      Animated.delay(150),

      // Orbs fade in
      Animated.timing(orbOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),

      // Logo spring + rings expand
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 35, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoRotate, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        Animated.timing(ringScale1, { toValue: 1, duration: 700, easing: Easing.out(Easing.exp), useNativeDriver: true }),
        Animated.timing(ringOpacity1, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(ringScale2, { toValue: 1, duration: 900, easing: Easing.out(Easing.exp), useNativeDriver: true }),
        Animated.timing(ringOpacity2, { toValue: 0.12, duration: 900, useNativeDriver: true }),
      ]),

      // Text line 1
      Animated.parallel([
        Animated.timing(text1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(text1Y, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),

      // Text line 2 + accent line expand
      Animated.parallel([
        Animated.timing(text2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(text2Y, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(lineWidth, { toValue: 60, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: false }),
      ]),

      // Shimmer sweep on logo
      Animated.timing(shimmerX, { toValue: width * 2, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
    ]).start();

    // ---- Floating Orb Loops ----
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbFloat1, { toValue: -18, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbFloat1, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbFloat2, { toValue: 14, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbFloat2, { toValue: -14, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = logoRotate.interpolate({
    inputRange: [-0.05, 0],
    outputRange: ['-5deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent animated />

      {/* ---- Rich Background Gradient ---- */}
      <LinearGradient
        colors={['#022B20', '#043D2D', '#065F46', '#0D9164']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ---- Background SVG Decoration ---- */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <SvgLinearGradient id="arcGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#34D399" stopOpacity="0.18" />
              <Stop offset="1" stopColor="#10B981" stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          {/* Large decorative arc top-right */}
          <Path
            d={`M ${width * 0.6} -60 Q ${width * 1.3} ${height * 0.35} ${width * 0.85} ${height * 0.7}`}
            stroke="#34D399"
            strokeWidth={1.2}
            strokeOpacity={0.15}
            fill="none"
          />
          {/* Second arc */}
          <Path
            d={`M ${width * 0.75} -40 Q ${width * 1.5} ${height * 0.4} ${width} ${height * 0.75}`}
            stroke="#10B981"
            strokeWidth={0.8}
            strokeOpacity={0.1}
            fill="none"
          />
          {/* Bottom wave */}
          <Path
            d={`M0 ${height * 0.78} C ${width * 0.25} ${height * 0.68}, ${width * 0.5} ${height * 0.88}, ${width} ${height * 0.72} L ${width} ${height} L 0 ${height} Z`}
            fill="rgba(6, 95, 70, 0.55)"
          />
          <Path
            d={`M0 ${height * 0.84} C ${width * 0.3} ${height * 0.76}, ${width * 0.65} ${height * 0.92}, ${width} ${height * 0.8} L ${width} ${height} L 0 ${height} Z`}
            fill="rgba(4, 61, 45, 0.7)"
          />
          {/* Subtle grid dots */}
          {[...Array(5)].map((_, row) =>
            [...Array(4)].map((__, col) => (
              <Circle
                key={`d-${row}-${col}`}
                cx={col * (width / 3.5) + 24}
                cy={row * 120 + 60}
                r={1.5}
                fill="#34D399"
                fillOpacity={0.1}
              />
            ))
          )}
        </Svg>
      </View>

      {/* ---- Floating Orbs ---- */}
      <Animated.View
        style={[styles.orb1, { opacity: orbOpacity, transform: [{ translateY: orbFloat1 }] }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.orb2, { opacity: orbOpacity, transform: [{ translateY: orbFloat2 }] }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.orb3, { opacity: orbOpacity, transform: [{ translateY: orbFloat1 }] }]}
        pointerEvents="none"
      />

      {/* ---- Main Content ---- */}
      <View style={styles.content}>

        {/* Logo Block */}
        <View style={styles.logoWrapper}>
          {/* Outer glow ring */}
          <Animated.View
            style={[styles.glowRing2, { transform: [{ scale: ringScale2 }], opacity: ringOpacity2 }]}
          />
          {/* Inner glow ring */}
          <Animated.View
            style={[styles.glowRing1, { transform: [{ scale: ringScale1 }], opacity: ringOpacity1 }]}
          />

          {/* Logo Circle */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { rotate: spin }],
              },
            ]}
          >
            {/* White glass card behind logo */}
            <LinearGradient
              colors={['rgba(255,255,255,0.96)', 'rgba(240,253,244,0.98)']}
              style={styles.logoGlass}
            >
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </LinearGradient>
            {/* Shimmer sweep */}
            <Animated.View
              style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerX }] },
              ]}
            />
          </Animated.View>
        </View>

        {/* Brand Name + Tag Lines */}
        <View style={styles.textBlock}>
          <Animated.View style={{ opacity: text1Opacity, transform: [{ translateY: text1Y }] }}>
            <Text style={styles.brandName}>Punnaigai</Text>
          </Animated.View>

          <Animated.View style={{ opacity: text2Opacity, transform: [{ translateY: text2Y }] }}>
            <Text style={styles.brandSub}>Small Finances</Text>

            {/* Animated accent line */}
            <Animated.View style={[styles.accentLine, { width: lineWidth }]} />

            <Text style={styles.tagline}>Small Steps · Big Dreams</Text>
          </Animated.View>
        </View>

      </View>

      {/* ---- Bottom Brand Strip ---- */}
      <View style={styles.bottomStrip}>
        <View style={styles.dotRow}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.footerText}>Trusted · Transparent · Together</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022B20',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  // ---- Floating Orbs ----
  orb1: {
    position: 'absolute',
    top: height * 0.08,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(52, 211, 153, 0.09)',
  },
  orb2: {
    position: 'absolute',
    top: height * 0.18,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(16, 185, 129, 0.07)',
  },
  orb3: {
    position: 'absolute',
    bottom: height * 0.2,
    right: 20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(52, 211, 153, 0.06)',
  },

  // ---- Logo ----
  logoWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 44,
  },
  glowRing1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#34D399',
  },
  glowRing2: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  logoContainer: {
    width: 170,
    height: 170,
    borderRadius: 85,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
  },
  logoGlass: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ skewX: '-20deg' }],
  },

  // ---- Text ----
  textBlock: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(16,185,129,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  brandSub: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6EE7B7',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  accentLine: {
    height: 3,
    backgroundColor: '#34D399',
    borderRadius: 2,
    marginTop: 14,
    marginBottom: 14,
    alignSelf: 'center',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  // ---- Bottom Strip ----
  bottomStrip: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#34D399',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
