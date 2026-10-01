import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export type IconName =
  | 'leaf'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-right'
  | 'chevron-left'
  | 'bell'
  | 'phone'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'check'
  | 'check-circle'
  | 'alert-circle'
  | 'alert-triangle'
  | 'credit-card'
  | 'file-text'
  | 'upload'
  | 'calendar'
  | 'clock'
  | 'grid'
  | 'more-horizontal'
  | 'user'
  | 'users'
  | 'shield'
  | 'star'
  | 'award'
  | 'send'
  | 'bank'
  | 'mail'
  | 'logout'
  | 'info'
  | 'help-circle'
  | 'refresh-cw'
  | 'plus'
  | 'dollar-sign'
  | 'wallet'
  | 'home'
  | 'trending-up'
  | 'pie-chart'
  | 'search'
  | 'file'
  | 'download'
  | 'menu'
  | 'hand-coin'
  | 'briefcase';

interface AppIconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  style?: ViewStyle;  
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  color = '#123E3E',
  style,
}) => {
  let iconName = name;
  if (name === 'logout') iconName = 'log-out';
  if (name === 'bank') iconName = 'home';
  if (name === 'wallet') iconName = 'credit-card';
  if (name === 'leaf') iconName = 'feather';

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {name === 'hand-coin' ? (
        <MaterialCommunityIcons name={iconName} size={size} color={color} />
      ) : (
        <Feather name={iconName} size={size} color={color} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
