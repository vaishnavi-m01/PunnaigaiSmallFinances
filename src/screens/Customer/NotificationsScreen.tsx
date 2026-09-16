import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon, IconName } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { markNotificationAsRead, markAllNotificationsAsRead, fetchDashboardThunk } from '../../store/customerSlice';
import { AppNotification } from '../../types/models';

/**
 * Screen 12: Notifications Screen
 * 5 categorized notifications with color-coded circular icon badges (Payment Reminder,
 * Loan Approved, Document Verified, New Offer, Welcome) and timestamps. Zero shadows.
 */
export const NotificationsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.customer.notifications);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchDashboardThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const getNotificationIconInfo = (type: string): { icon: IconName; bg: string; color: string } => {
    switch (type) {
      case 'reminder':
        return { icon: 'bell', bg: '#FEE2E2', color: '#EF4444' };
      case 'approval':
        return { icon: 'check-circle', bg: '#EAF5EE', color: '#10B981' };
      case 'document':
        return { icon: 'shield', bg: '#E0F2FE', color: '#0284C7' };
      case 'offer':
        return { icon: 'star', bg: '#FEF3C7', color: '#F59E0B' };
      case 'welcome':
      default:
        return { icon: 'leaf', bg: '#EAF5EE', color: '#0D523B' };
    }
  };

  const renderNotificationCard = ({ item }: { item: AppNotification }) => {
    const iconInfo = getNotificationIconInfo(item.type);

    return (
      <Card
        style={[
          styles.notifCard,
          {
            backgroundColor: '#FFFFFF',
            borderColor: item.isRead ? '#E2E8F0' : '#A7F3D0',
          },
        ]}
        variant="flat"
        padding={12}
        onPress={() => dispatch(markNotificationAsRead(item.id))}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
            <AppIcon name={iconInfo.icon} size={16} color={iconInfo.color} />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.notifTitle}>
                {item.title}
              </Text>
              <Text style={styles.notifTime}>
                {item.timeAgo}
              </Text>
            </View>

            <Text style={styles.notifMessage}>
              {item.message}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Notifications"
        showBack={true}
        rightComponent={
          <TouchableOpacity
            onPress={() => dispatch(markAllNotificationsAsRead())}
            activeOpacity={0.7}
            style={styles.markReadBtn}
          >
            <Text style={styles.markReadText}>
              Mark all read
            </Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {isRefreshing ? (
          <View style={{ paddingTop: 8 }}>
            <Skeleton height={80} borderRadius={12} style={{ marginBottom: 8 }} />
            <Skeleton height={80} borderRadius={12} style={{ marginBottom: 8 }} />
            <Skeleton height={80} borderRadius={12} style={{ marginBottom: 8 }} />
            <Skeleton height={80} borderRadius={12} style={{ marginBottom: 8 }} />
            <Skeleton height={80} borderRadius={12} style={{ marginBottom: 8 }} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderNotificationCard}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#0D523B" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppIcon name="bell" size={36} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  No notifications right now.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  notifCard: {
    borderWidth: 1,
    borderRadius: 14,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
  notifTime: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  notifMessage: {
    color: '#64748B',
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  markReadBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  markReadText: {
    color: '#0D523B',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
  },
});
