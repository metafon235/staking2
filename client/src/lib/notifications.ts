import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: 'reward' | 'price_change' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: string;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

export function useNotificationsProvider() {
  const [lastRewardCheck, setLastRewardCheck] = useState<number>(Date.now());
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Handle new reward notifications
  useEffect(() => {
    const rewardNotifications = notifications.filter(
      n => n.type === 'reward' && !n.read && new Date(n.createdAt).getTime() > lastRewardCheck
    );

    rewardNotifications.forEach(notification => {
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
    });

    if (rewardNotifications.length > 0) {
      setLastRewardCheck(Date.now());
    }
  }, [notifications, lastRewardCheck]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      credentials: 'include',
    });
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      credentials: 'include',
    });
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}