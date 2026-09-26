import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { Header } from '../../component/Header';
import { Card } from '../../component/Common/Card';
import { AppIcon, IconName } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchNotificationsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
} from '../../store/customerSlice';
import { AppNotification } from '../../types/models';

/**
 * Notifications Screen
 * Fetches from GET /notifications (real API).
 * Marks individual read via PATCH /notifications/:id/read.
 * Marks all read via POST /notifications/read-all.
 */
export const NotificationsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.customer.notifications);
  const isLoading = useAppSelector(state => state.customer.isLoading);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchNotificationsThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const handleMarkRead = (item: AppNotification) => {
    // Optimistic local update
    dispatch(markNotificationAsRead(item.id));
    // API call
    dispatch(markNotificationReadThunk(item.numericId));
  };

  const handleMarkAllRead = () => {
    // Optimistic local update
    dispatch(markAllNotificationsAsRead());
    // API call
    dispatch(markAllNotificationsReadThunk());
  };

  const getNotificationIconInfo = (type: string): { icon: IconName; bg: string; color: string } => {
    switch (type) {
      case 'reminder':
        return { icon: 'alert-triangle', bg: '#FEE2E2', color: '#EF4444' };
      case 'approval':
        return { icon: 'check-circle', bg: '#EAF5EE', color: '#10B981' };
      case 'document':
        return { icon: 'shield', bg: '#E0F2FE', color: '#0284C7' };
      case 'offer':
        return { icon: 'star', bg: '#FEF3C7', color: '#F59E0B' };
      case 'system':
      default:
        return { icon: 'bell', bg: '#EAF5EE', color: '#0D523B' };
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
        onPress={() => handleMarkRead(item)}
      >
        <View style={styles.cardContent}>
          {/* Icon Badge */}
          <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
            <AppIcon name={iconInfo.icon} size={16} color={iconInfo.color} />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <View style={styles.titleLeft}>
                {!item.isRead && <View style={styles.unreadDot} />}
                <Text style={[styles.notifTitle, !item.isRead && { color: '#0D523B' }]}>
                  {item.title}
                </Text>
              </View>
              <Text style={styles.notifTime}>{item.timeAgo}</Text>
            </View>

            <Text style={styles.notifMessage}>{item.message}</Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderSkeleton = () => (
    <View style={{ paddingTop: 8 }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} height={80} borderRadius={12} style={{ marginBottom: 8 }} />
      ))}
    </View>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Notifications"
        showBack={true}
        rightComponent={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              activeOpacity={0.7}
              style={styles.markReadBtn}
            >
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
          onPress={() => setFilter('ALL')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'UNREAD' && styles.filterTabActive]}
          onPress={() => setFilter('UNREAD')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'UNREAD' && styles.filterTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'READ' && styles.filterTabActive]}
          onPress={() => setFilter('READ')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'READ' && styles.filterTextActive]}>
            Read ({notifications.length - unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {(isLoading && notifications.length === 0) ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={notifications.filter(n => {
              if (filter === 'ALL') return true;
              if (filter === 'UNREAD') return !n.isRead;
              if (filter === 'READ') return n.isRead;
              return true;
            })}
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
                <AppIcon name="bell" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptyText}>You're all caught up! Check back later.</Text>
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
    paddingBottom: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#0D523B',
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
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    flexShrink: 0,
  },
  notifTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  notifTime: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 6,
    flexShrink: 0,
  },
  notifMessage: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EAF5EE',
    borderRadius: 8,
  },
  markReadText: {
    color: '#0D523B',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
