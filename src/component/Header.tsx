import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { BrandLogo } from './Common/BrandLogo';
import { useAppSelector } from '../hooks/useAppHooks';
import { ROUTES } from '../constants/routes';
import { AppNotification } from '../types/models';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  showNotification?: boolean;
  style?: ViewStyle;
  titleColor?: string;
  backgroundColor?: string;
  disableTopInset?: boolean;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBackPress,
  rightComponent,
  showNotification = false,
  style,
  titleColor = '#0F172A',
  backgroundColor = '#FFFFFF',
  disableTopInset = false,
  showLogo = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const unreadCount = useAppSelector(
    state =>
      state.customer.notifications.filter((n: AppNotification) => !n.isRead)
        .length,
  );

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate(ROUTES.CUSTOMER_NOTIFICATIONS);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderBottomColor: '#F1F5F9',
          paddingTop: disableTopInset ? 0 : Math.max(insets.top, 8),
          height: disableTopInset ? 52 : 52 + Math.max(insets.top, 8),
        },
        style,
      ]}
    >
      {showBack ? (
        <>
          <View style={styles.leftContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <AppIcon name="arrow-left" size={26} color="#0D523B" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerContainer}>
            {title ? (
              <Text
                style={[
                  styles.title,
                  { color: titleColor, textAlign: 'center' },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {title}
              </Text>
            ) : null}
          </View>
        </>
      ) : (
        <>
          <View style={styles.leftContainer} />
          <View style={styles.centerContainer}>
            {title ? (
              <Text
                style={[styles.title, { color: titleColor, textAlign: 'center' }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {title}
              </Text>
            ) : null}
          </View>
        </>
      )}

      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : showNotification ? (
          <TouchableOpacity
            style={styles.notifButton}
            onPress={handleNotificationPress}
            activeOpacity={0.7}
          >
            <AppIcon name="bell" size={20} color="#0D523B" />
            {unreadCount > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerLogo: {
    marginRight: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  notifButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
});
