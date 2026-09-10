import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

interface BrandLogoProps {
  size?: number;
  variant?: 'light' | 'dark' | 'white';
  showTagline?: boolean;
  style?: ViewStyle;
}


export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 64,
  variant = 'dark',
  showTagline = true,
  style,
}) => {
  const isWhite = variant === 'white';
  const primaryTextColor = isWhite ? '#FFFFFF' : '#0D523B';
  const subtitleColor = isWhite ? '#E0EDED' : '#0D523B';
  const taglineColor = isWhite ? '#A7F3D0' : '#475569';

  const iconSize = size;
  const titleFontSize = Math.max(16, Math.round(size * 0.3));
  const subFontSize = Math.max(10, Math.round(size * 0.18));
  const tagFontSize = Math.max(8, Math.round(size * 0.12));

  return (
    <View style={[styles.container, style]}>
      {/* 3-Leaf Botanical Sprout Icon */}
      <View style={[styles.iconContainer, { width: iconSize, height: iconSize * 0.85 }]}>
        <Svg width={iconSize} height={iconSize * 0.85} viewBox="0 0 100 85" fill="none">
          <Defs>
            <SvgGradient id="centerLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="50%" stopColor="#10B981" />
              <Stop offset="100%" stopColor="#059669" />
            </SvgGradient>

            <SvgGradient id="leftLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#6EE7B7" />
              <Stop offset="100%" stopColor="#10B981" />
            </SvgGradient>

            <SvgGradient id="rightLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#86EFAC" />
              <Stop offset="100%" stopColor="#059669" />
            </SvgGradient>
          </Defs>

          {/* Left Leaf */}
          <Path
            d="M 50 68 C 30 65 10 52 14 30 C 26 24 45 42 50 68 Z"
            fill="url(#leftLeafGrad)"
          />

          {/* Center Tall Leaf */}
          <Path
            d="M 50 72 C 38 48 38 18 50 6 C 62 18 62 48 50 72 Z"
            fill="url(#centerLeafGrad)"
          />

          {/* Right Leaf */}
          <Path
            d="M 50 68 C 70 65 90 52 86 30 C 74 24 55 42 50 68 Z"
            fill="url(#rightLeafGrad)"
          />

          {/* Center Vein Accent */}
          <Path
            d="M 50 64 L 50 14"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* Brand Title: PUNNAIGAI */}
      <Text
        style={[
          styles.brandTitle,
          {
            color: primaryTextColor,
            fontSize: titleFontSize,
            letterSpacing: 2,
          },
        ]}
      >
        PUNNAIGAI
      </Text>

      {/* Subtitle: FINANCES */}
      <Text
        style={[
          styles.brandSubtitle,
          {
            color: subtitleColor,
            fontSize: subFontSize,
            letterSpacing: 4,
          },
        ]}
      >
        FINANCES
      </Text>

      {/* Tagline: Your Growth Our Priority */}
      {showTagline && (
        <Text
          style={[
            styles.brandTagline,
            {
              color: taglineColor,
              fontSize: tagFontSize,
            },
          ]}
        >
          Your Growth Our Priority
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandTitle: {
    fontWeight: '900',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 1,
  },
  brandTagline: {
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
