import { create } from 'zustand';

export interface AppNotification {
  id: string;
  caseId: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

type AddNotificationPayload = Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>;

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (payload: AddNotificationPayload) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (payload: AddNotificationPayload) => {
    const state = get();
    const newNotification: AppNotification = {
      ...payload,
      id: String(state.notifications.length + 1),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    set({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    });
  },

  markRead: (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = updated.filter((n) => !n.isRead).length;
      return { notifications: updated, unreadCount };
    });
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
