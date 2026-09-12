import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppIcon, IconName } from '../../component/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Customer Assigned',
    message: 'You have been assigned a new customer: Ramesh (L12345)',
    time: '2 mins ago',
    isRead: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Collection Target Reached',
    message: 'Congratulations! You reached your daily collection target.',
    time: '1 hour ago',
    isRead: true,
    type: 'success',
  },
  {
    id: '3',
    title: 'Missed EMI',
    message: 'Customer Suresh (L98765) missed their EMI payment yesterday.',
    time: '1 day ago',
    isRead: true,
    type: 'warning',
  },
];

export const AgentNotificationsScreen: React.FC = () => {
  const { colors, typography } = useAppTheme();
  const navigation = useNavigation();

  const renderNotification = ({ item }: { item: Notification }) => {
    let iconName: IconName = 'info';
    let iconColor = colors.primary;
    let bgColor = colors.primaryLight;

    if (item.type === 'success') {
      iconName = 'check-circle';
      iconColor = '#16A34A';
      bgColor = '#DCFCE7';
    } else if (item.type === 'warning') {
      iconName = 'alert-triangle';
      iconColor = '#EAB308';
      bgColor = '#FEF9C3';
    }

    return (
      <View style={[styles.notificationCard, { backgroundColor: item.isRead ? colors.surface : '#F8FAFC' }]}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <AppIcon name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[typography.bodyLarge, styles.title, { color: colors.textPrimary }]}>
              {item.title}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {item.time}
            </Text>
          </View>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            {item.message}
          </Text>
        </View>
        {!item.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <AppIcon name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.white }]}>
          Notifications
        </Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
    width: 40,
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },
});
