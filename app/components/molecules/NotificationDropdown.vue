<template>
  <TobiPopover>
    <TobiButton variant="ghost" size="sm" class="relative">
      <TobiIcon name="i-lucide-bell" class="w-5 h-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </TobiButton>

    <template #content>
      <div class="p-0 w-96">
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-muted">
          <h3 class="font-semibold">Thông báo</h3>
          <TobiButton
            v-if="unreadCount > 0"
            variant="ghost"
            size="xs"
            @click="markAllAsRead">
            Đánh dấu tất cả đã đọc
          </TobiButton>
        </div>

        <!-- Notification list -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="loading && notifications.length === 0" class="p-4">
            <div class="flex items-center justify-center">
              <TobiIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
            </div>
          </div>

          <div
            v-else-if="notifications.length === 0"
            class="p-8 text-center text-muted">
            <TobiIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-2" />
            <p>Không có thông báo</p>
          </div>

          <div v-else>
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="p-4 border-b border-muted hover:bg-muted/50 cursor-pointer transition-colors"
              :class="{ 'bg-muted/30': !notification.isRead }"
              @click="openNotificationDetail(notification)">
              <div class="flex items-start gap-3">
                <div class="shrink-0">
                  <TobiIcon
                    :name="getNotificationIcon(notification.type)"
                    class="w-5 h-5"
                    :class="getNotificationIconClass(notification.type)" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <p class="font-medium text-sm line-clamp-1">
                      {{ notification.title }}
                    </p>
                    <TobiButton
                      variant="ghost"
                      size="xs"
                      class="shrink-0"
                      @click.stop="handleDelete(notification.id)">
                      <TobiIcon name="i-lucide-x" class="w-4 h-4" />
                    </TobiButton>
                  </div>
                  <p class="text-xs text-muted mt-1 line-clamp-2">
                    {{ stripHtml(notification.content) }}
                  </p>
                  <p class="text-xs text-muted mt-1">
                    {{ formatTime(notification.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Load more button -->
            <div v-if="hasMore" class="p-4">
              <TobiButton
                variant="ghost"
                size="sm"
                class="w-full"
                :loading="loading"
                @click="loadMore">
                Xem thêm
              </TobiButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </TobiPopover>

  <!-- Detail Modal -->
  <TobiModal
    :open="showDetailModal"
    title="Chi tiết thông báo"
    @update:open="(v) => (showDetailModal = v)">
    <template #body>
      <div v-if="selectedNotification" class="space-y-4">
        <div class="flex items-center gap-3">
          <TobiIcon
            :name="getNotificationIcon(selectedNotification.type)"
            class="w-6 h-6"
            :class="getNotificationIconClass(selectedNotification.type)" />
          <h4 class="font-semibold text-lg">
            {{ selectedNotification.title }}
          </h4>
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          class="prose prose-sm max-w-none"
          v-html="selectedNotification.content" />
        <p class="text-sm text-muted">
          {{ formatTime(selectedNotification.createdAt) }}
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <TobiButton
          v-if="selectedNotification?.metadata?.productId"
          @click="navigateToProduct">
          Xem sản phẩm
        </TobiButton>
        <TobiButton variant="outline" @click="showDetailModal = false">
          Đóng
        </TobiButton>
      </div>
    </template>
  </TobiModal>
</template>

<script setup lang="ts">
import type { Notification, NotificationType } from "~/types";

const {
  notifications,
  unreadCount,
  loading,
  hasMore,
  loadMore,
  markAsRead,
  deleteNotification,
  initialize,
} = useNotification();

const router = useRouter();

// Modal state
const showDetailModal = ref(false);
const selectedNotification = ref<Notification | null>(null);

onMounted(() => {
  initialize();
});

const markAllAsRead = () => {
  markAsRead(undefined, true);
};

// Strip HTML tags for preview
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, "");
};

// Open detail modal
const openNotificationDetail = async (notification: Notification) => {
  selectedNotification.value = notification;
  showDetailModal.value = true;

  if (!notification.isRead) {
    await markAsRead(notification.id);
  }
};

// Navigate to product
const navigateToProduct = () => {
  const metadata = selectedNotification.value?.metadata as Record<
    string,
    string
  > | null;
  if (metadata?.productId) {
    showDetailModal.value = false;
    router.push(`/user/products/${metadata.productId}`);
  }
};

const handleDelete = (id: string) => {
  deleteNotification(id);
};

const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    SYSTEM: "i-lucide-info",
    WARNING: "i-lucide-alert-triangle",
    ACCOUNT_LOCKED: "i-lucide-lock",
    REVIEW_LIKE: "i-lucide-heart",
    REVIEW_REPLY: "i-lucide-message-circle",
    PRODUCT_LIKE: "i-lucide-heart",
    PRODUCT_COMMENT: "i-lucide-message-square",
    PRODUCT_SAVE: "i-lucide-bookmark",
    ADMIN_MESSAGE: "i-lucide-mail",
  };
  return icons[type] || "i-lucide-bell";
};

const getNotificationIconClass = (type: NotificationType): string => {
  const classes: Record<NotificationType, string> = {
    SYSTEM: "text-blue-500",
    WARNING: "text-yellow-500",
    ACCOUNT_LOCKED: "text-red-500",
    REVIEW_LIKE: "text-pink-500",
    REVIEW_REPLY: "text-green-500",
    PRODUCT_LIKE: "text-pink-500",
    PRODUCT_COMMENT: "text-purple-500",
    PRODUCT_SAVE: "text-orange-500",
    ADMIN_MESSAGE: "text-indigo-500",
  };
  return classes[type] || "";
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN");
};
</script>
