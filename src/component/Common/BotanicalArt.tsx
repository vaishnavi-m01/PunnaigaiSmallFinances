import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, G } from 'react-native-svg';

interface BotanicalLeavesProps {
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * Botanical Leaf watermarks for corner and background accents.
 */
export const BotanicalLeaves: React.FC<BotanicalLeavesProps> = ({
  width = 200,
  height = 140,
  opacity = 0.15,
  color = '#10B981',
  style,
}) => {
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Svg width={width} height={height} viewBox="0 0 200 140" fill="none">
        <G opacity={opacity}>
          {/* Main big leaf */}
          <Path
            d="M 10 130 C 30 70 80 40 160 30 C 140 80 100 120 10 130 Z"
            fill={color}
          />
          <Path
            d="M 10 130 Q 80 80 160 30"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Secondary leaf */}
          <Path
            d="M 80 135 C 100 85 150 70 195 65 C 185 105 145 130 80 135 Z"
            fill={color}
          />

          {/* Small accent leaf */}
          <Path
            d="M 30 140 C 40 100 70 85 110 80 C 100 110 75 135 30 140 Z"
            fill={color}
          />
        </G>
      </Svg>
    </View>
  );
};

interface FinanceGrowthArtProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * Illustration of Gold Coins & Sprouting Plant for the Promotional Growth Banner
 */
export const FinanceGrowthArt: React.FC<FinanceGrowthArtProps> = ({
  size = 70,
  style,
}) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <SvgGradient id="coinGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FDE68A" />
            <Stop offset="45%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#D97706" />
          </SvgGradient>
          <SvgGradient id="plantLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#86EFAC" />
            <Stop offset="60%" stopColor="#22C55E" />
            <Stop offset="100%" stopColor="#15803D" />
          </SvgGradient>
        </Defs>

        {/* Stack of Coins - Coin 1 */}
        <Circle cx="45" cy="72" r="18" fill="url(#coinGold)" stroke="#B45309" strokeWidth="1.5" />
        <Circle cx="45" cy="72" r="14" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="3 2" />

        {/* Coin 2 (Front Right) */}
        <Circle cx="68" cy="78" r="15" fill="url(#coinGold)" stroke="#B45309" strokeWidth="1.5" />
        <Circle cx="68" cy="78" r="11" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="2 2" />

        {/* Sprouting Plant Stem */}
        <Path
          d="M 45 60 C 45 42 48 30 50 18"
          stroke="#15803D"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Left Leaf Sprout */}
        <Path
          d="M 48 38 C 30 36 24 24 28 14 C 40 14 46 26 48 38 Z"
          fill="url(#plantLeaf)"
        />

        {/* Right Leaf Sprout */}
        <Path
          d="M 49 28 C 65 24 72 12 68 4 C 54 4 48 16 49 28 Z"
          fill="url(#plantLeaf)"
        />

        {/* Top Little Sprout */}
        <Path
          d="M 50 18 C 42 12 44 4 50 2 C 56 4 58 12 50 18 Z"
          fill="url(#plantLeaf)"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
