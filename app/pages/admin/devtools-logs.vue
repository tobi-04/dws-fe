<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">Danh sách F12/DevTools</h2>
        <p class="text-sm text-muted mt-1">
          Người dùng sử dụng F12/DevTools từ 10 lần/ngày trở lên
        </p>
      </div>
      <TobiButton variant="outline" @click="refresh">
        <TobiIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-2" />
        Làm mới
      </TobiButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-background rounded-lg p-4 border border-muted">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-yellow-100">
            <TobiIcon
              name="i-lucide-alert-triangle"
              class="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p class="text-sm text-muted">Tổng số vi phạm</p>
            <p class="text-2xl font-bold">{{ stats?.total || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-background rounded-lg p-4 border border-muted">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-orange-100">
            <TobiIcon name="i-lucide-user-x" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p class="text-sm text-muted">Đang cảnh báo (10-14)</p>
            <p class="text-2xl font-bold">{{ warningCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-background rounded-lg p-4 border border-muted">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-red-100">
            <TobiIcon name="i-lucide-lock" class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-muted">Bị khóa (≥15)</p>
            <p class="text-2xl font-bold">{{ lockedCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-background rounded-lg border border-muted overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <TobiIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin mx-auto" />
        <p class="text-muted mt-2">Đang tải...</p>
      </div>

      <div v-else-if="!stats?.data?.length" class="p-8 text-center">
        <TobiIcon
          name="i-lucide-shield-check"
          class="w-12 h-12 mx-auto text-green-500" />
        <p class="text-lg font-medium mt-2">Không có vi phạm</p>
        <p class="text-muted">
          Chưa có người dùng nào sử dụng F12/DevTools quá 10 lần hôm nay
        </p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-muted/50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium">Người dùng</th>
            <th class="px-4 py-3 text-center text-sm font-medium">Số lần</th>
            <th class="px-4 py-3 text-center text-sm font-medium">
              Trạng thái
            </th>
            <th class="px-4 py-3 text-left text-sm font-medium">Lần cuối</th>
            <th class="px-4 py-3 text-right text-sm font-medium">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in stats?.data"
            :key="item.userId"
            class="border-t border-muted hover:bg-muted/30 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <TobiIcon name="i-lucide-user" class="w-4 h-4 text-muted" />
                <span class="font-medium">{{ item.username }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getCountClass(item.count)">
                {{ item.count }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="getStatusClass(item.count)">
                {{ getStatusText(item.count) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-muted">
              {{ formatTime(item.lastDetected) }}
            </td>
            <td class="px-4 py-3 text-right">
              <TobiButton
                variant="ghost"
                size="xs"
                @click="sendWarningNotification(item)">
                <TobiIcon name="i-lucide-send" class="w-4 h-4" />
              </TobiButton>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        v-if="stats && stats.totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border border-muted-t">
        <p class="text-sm text-muted">
          Trang {{ page }} / {{ stats.totalPages }}
        </p>
        <div class="flex gap-2">
          <TobiButton
            variant="outline"
            size="sm"
            :disabled="page <= 1"
            @click="page--">
            Trước
          </TobiButton>
          <TobiButton
            variant="outline"
            size="sm"
            :disabled="page >= stats.totalPages"
            @click="page++">
            Sau
          </TobiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaginatedDevToolsStats, DevToolsUserStats } from "~/types";

definePageMeta({
  layout: "admin",
});

const toast = useToast();

const page = ref(1);
const loading = ref(false);
const stats = ref<PaginatedDevToolsStats | null>(null);

const loadStats = async () => {
  loading.value = true;
  try {
    stats.value = await api.getFrequentDevToolsUsers(page.value, 20);
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể tải dữ liệu",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const refresh = () => {
  loadStats();
};

watch(page, () => {
  loadStats();
});

onMounted(() => {
  loadStats();
});

const warningCount = computed(() => {
  return (
    stats.value?.data?.filter((item) => item.count >= 10 && item.count < 15)
      .length || 0
  );
});

const lockedCount = computed(() => {
  return stats.value?.data?.filter((item) => item.count >= 15).length || 0;
});

const getCountClass = (count: number): string => {
  if (count >= 15) return "bg-red-100 text-red-700";
  if (count >= 10) return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
};

const getStatusClass = (count: number): string => {
  if (count >= 15) return "bg-red-500 text-white";
  if (count >= 10) return "bg-yellow-500 text-white";
  return "bg-gray-500 text-white";
};

const getStatusText = (count: number): string => {
  if (count >= 15) return "Đã khóa";
  if (count >= 10) return "Cảnh báo";
  return "Bình thường";
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN");
};

const sendWarningNotification = async (item: DevToolsUserStats) => {
  try {
    await api.sendNotification(
      item.userId,
      "⚠️ Cảnh báo bảo mật",
      `<p>Bạn đã sử dụng Developer Tools <strong>${item.count} lần</strong> trong ngày hôm nay.</p><p>Vui lòng dừng hành vi này để tránh bị khóa tài khoản.</p>`
    );
    toast.add({
      title: "Thành công",
      description: `Đã gửi cảnh báo đến ${item.username}`,
      color: "success",
    });
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể gửi thông báo",
      color: "error",
    });
  }
};
</script>
