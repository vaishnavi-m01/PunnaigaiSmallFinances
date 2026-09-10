import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

interface BrandLogoProps {
  size?: number;
  variant?: 'light' | 'dark' | 'white';
  showTagline?: boolean;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 64,
  variant: _variant = 'dark',
  showTagline: _showTagline = true,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        style,
      ]}
      accessible
      accessibilityLabel="Punnaigai Small Finance"
    >
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: size * 2.8, height: size * 2.8 }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
