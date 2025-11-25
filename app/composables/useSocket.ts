import { io, Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  currentProductId: string | null;
}

const state = reactive<SocketState>({
  socket: null,
  connected: false,
  currentProductId: null,
});

export const useSocket = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const connect = () => {
    if (state.socket?.connected) return;

    // WebSocket phải kết nối trực tiếp tới backend, không qua proxy
    const wsUrl = config.public.wsUrl || "http://localhost:3003";

    state.socket = io(`${wsUrl}/events`, {
      auth: {
        token: authStore.token,
      },
      transports: ["websocket"],
      autoConnect: true,
    });

    state.socket.on("connect", () => {
      state.connected = true;
      console.log("Socket connected");

      // Rejoin product room if was previously in one
      if (state.currentProductId) {
        state.socket?.emit("joinProduct", state.currentProductId);
      }
    });

    state.socket.on("disconnect", () => {
      state.connected = false;
      console.log("Socket disconnected");
    });

    state.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  };

  const disconnect = () => {
    if (state.socket) {
      state.socket.disconnect();
      state.socket = null;
      state.connected = false;
      state.currentProductId = null;
    }
  };

  const joinProductRoom = (productId: string) => {
    state.currentProductId = productId;
    if (state.socket?.connected) {
      state.socket.emit("joinProduct", productId);
    }
  };

  const leaveProductRoom = (productId: string) => {
    if (state.socket?.connected) {
      state.socket.emit("leaveProduct", productId);
    }
    if (state.currentProductId === productId) {
      state.currentProductId = null;
    }
  };

  // Event listeners
  const onNewReview = (callback: (review: any) => void) => {
    state.socket?.on("newReview", callback);
    return () => state.socket?.off("newReview", callback);
  };

  const onReviewUpdated = (callback: (review: any) => void) => {
    state.socket?.on("reviewUpdated", callback);
    return () => state.socket?.off("reviewUpdated", callback);
  };

  const onReviewDeleted = (callback: (data: { reviewId: string }) => void) => {
    state.socket?.on("reviewDeleted", callback);
    return () => state.socket?.off("reviewDeleted", callback);
  };

  const onReviewVisibilityChanged = (
    callback: (data: { reviewId: string; isHidden: boolean }) => void
  ) => {
    state.socket?.on("reviewVisibilityChanged", callback);
    return () => state.socket?.off("reviewVisibilityChanged", callback);
  };

  const onProductReactionUpdated = (
    callback: (data: {
      count: number;
      userId: string;
      reacted: boolean;
    }) => void
  ) => {
    state.socket?.on("productReactionUpdated", callback);
    return () => state.socket?.off("productReactionUpdated", callback);
  };

  const onProductSavedUpdated = (
    callback: (data: { userId: string; saved: boolean }) => void
  ) => {
    state.socket?.on("productSavedUpdated", callback);
    return () => state.socket?.off("productSavedUpdated", callback);
  };

  const onAccountBanned = (callback: () => void) => {
    if (!state.socket) return () => {};
    state.socket.on("accountBanned", callback);
    return () => state.socket?.off("accountBanned", callback);
  };

  const onNotificationDeleted = (
    callback: (data: { notificationIds: string[] }) => void
  ) => {
    if (!state.socket) return () => {};
    state.socket.on("notificationDeleted", callback);
    return () => state.socket?.off("notificationDeleted", callback);
  };

  return {
    socket: computed(() => state.socket),
    connected: computed(() => state.connected),
    currentProductId: computed(() => state.currentProductId),
    connect,
    disconnect,
    joinProductRoom,
    leaveProductRoom,
    onNewReview,
    onReviewUpdated,
    onReviewDeleted,
    onReviewVisibilityChanged,
    onProductReactionUpdated,
    onProductSavedUpdated,
    onAccountBanned,
    onNotificationDeleted,
  };
};
