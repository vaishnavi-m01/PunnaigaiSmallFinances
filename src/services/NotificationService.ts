import { AppNotification } from '../types/models';

class NotificationService {
  private notifications: AppNotification[] = [];

  async getNotifications(): Promise<AppNotification[]> {
    return [...this.notifications];
  }

  async markAsRead(id: string): Promise<void> {
    this.notifications = this.notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
  }

  async markAllAsRead(): Promise<void> {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
  }

  async addNotification(notification: Omit<AppNotification, 'id'>): Promise<AppNotification> {
    const newNotification: AppNotification = {
      ...notification,
      id: `NT_${Date.now()}`,
    };
    this.notifications.unshift(newNotification);
    return newNotification;
  }
}

export const notificationService = new NotificationService();
