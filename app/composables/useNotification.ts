import type { Notification, PaginatedNotifications } from "~/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
}

const state = reactive<NotificationState>({
  notifications: [],
  unreadCount: 0,
  page: 1,
  hasMore: true,
  loading: false,
});

export const useNotification = () => {
  const { socket, connected } = useSocket();
  const toast = useToast();

  // Load notifications
  const loadNotifications = async (reset: boolean = false) => {
    if (state.loading) return;
    if (!reset && !state.hasMore) return;

    state.loading = true;
    try {
      const page = reset ? 1 : state.page;
      const result: PaginatedNotifications = await api.getNotifications(
        page,
        10
      );

      if (reset) {
        state.notifications = result.data;
      } else {
        state.notifications = [...state.notifications, ...result.data];
      }

      state.page = page + 1;
      state.hasMore = result.hasMore;
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      state.loading = false;
    }
  };

  // Load more
  const loadMore = () => {
    if (!state.loading && state.hasMore) {
      loadNotifications(false);
    }
  };

  // Refresh notifications
  const refresh = () => {
    state.page = 1;
    state.hasMore = true;
    loadNotifications(true);
  };

  // Get unread count
  const fetchUnreadCount = async () => {
    try {
      const result = await api.getUnreadCount();
      state.unreadCount = result.count;
    } catch (error) {
      console.error("Failed to get unread count:", error);
    }
  };

  // Mark as read
  const markAsRead = async (notificationId?: string, all?: boolean) => {
    try {
      await api.markNotificationAsRead(notificationId, all);

      if (all) {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
        state.unreadCount = 0;
      } else if (notificationId) {
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      const notification = state.notifications.find((n) => n.id === id);
      state.notifications = state.notifications.filter((n) => n.id !== id);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Listen to socket events
  const setupSocketListeners = () => {
    if (!socket.value) return;

    socket.value.on("notification", (notification: Notification) => {
      // Add to beginning of list
      state.notifications = [notification, ...state.notifications];
      state.unreadCount++;

      // Show toast
      toast.add({
        title: notification.title,
        description:
          notification.content.replace(/<[^>]*>/g, "").substring(0, 100) +
          "...",
        color: notification.type === "WARNING" ? "warning" : "info",
      });
    });

    socket.value.on("unreadCountUpdate", (data: { count: number }) => {
      state.unreadCount = data.count;
    });

    // Listen for notification deleted (e.g., when unlike, unsave, etc.)
    socket.value.on(
      "notificationDeleted",
      (data: { notificationIds: string[] }) => {
        const deletedIds = new Set(data.notificationIds);
        const deletedUnreadCount = state.notifications.filter(
          (n) => deletedIds.has(n.id) && !n.isRead
        ).length;

        state.notifications = state.notifications.filter(
          (n) => !deletedIds.has(n.id)
        );
        state.unreadCount = Math.max(0, state.unreadCount - deletedUnreadCount);
      }
    );
  };

  // Initialize on mount
  const initialize = () => {
    try {
      fetchUnreadCount();
      loadNotifications(true);

      if (connected.value) {
        setupSocketListeners();
      }

      // Watch for connection changes
      watch(connected, (isConnected) => {
        if (isConnected) {
          setupSocketListeners();
        }
      });
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  };

  return {
    notifications: computed(() => state.notifications),
    unreadCount: computed(() => state.unreadCount),
    loading: computed(() => state.loading),
    hasMore: computed(() => state.hasMore),
    loadNotifications,
    loadMore,
    refresh,
    fetchUnreadCount,
    markAsRead,
    deleteNotification,
    initialize,
  };
};
