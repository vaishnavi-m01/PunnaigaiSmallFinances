import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design dimensions (standard mobile 375x812)
const baseWidth = 375;
const baseHeight = 812;

export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

export const scale = (size: number): number => {
  return (SCREEN_WIDTH / baseWidth) * size;
};

export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / baseHeight) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 360,
};
