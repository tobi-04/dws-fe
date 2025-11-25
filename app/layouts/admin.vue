<template>
  <div class="min-h-screen bg-muted">
    <!-- Header -->
    <header class="border-b border-muted">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <div class="flex items-center gap-4">
          <NotificationDropdown />
          <span class="text-sm text-muted">{{ authStore.user?.username }}</span>
          <TobiButton
            color="error"
            variant="outline"
            size="sm"
            @click="handleLogout">
            Đăng xuất
          </TobiButton>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 min-h-[calc(100vh-73px)] border-r border-muted">
        <nav class="p-4 space-y-2">
          <NuxtLink
            to="/admin/statistics"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-muted hover:text-primary transition-colors"
            active-class="bg-muted text-primary font-semibold">
            <TobiIcon name="i-lucide-bar-chart-3" class="w-5 h-5" />
            <span>Thống kê</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/products"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-muted hover:text-primary transition-colors"
            active-class="bg-muted text-primary font-semibold">
            <TobiIcon name="i-lucide-package" class="w-5 h-5" />
            <span>Sản phẩm</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/products/trash"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-muted hover:text-primary transition-colors"
            active-class="bg-muted text-primary font-semibold">
            <TobiIcon name="i-lucide-trash-2" class="w-5 h-5" />
            <span>Thùng rác</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/users"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-muted hover:text-primary transition-colors"
            active-class="bg-muted text-primary font-semibold">
            <TobiIcon name="i-lucide-users" class="w-5 h-5" />
            <span>Người dùng</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/notifications"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-muted hover:text-primary transition-colors"
            active-class="bg-muted text-primary font-semibold">
            <TobiIcon name="i-lucide-send" class="w-5 h-5" />
            <span>Gửi thông báo</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/devtools-logs"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-muted hover:text-primary transition-colors"
            active-class="bg-muted text-primary font-semibold">
            <TobiIcon name="i-lucide-shield-alert" class="w-5 h-5" />
            <span>F12 Logs</span>
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <!-- Banned User Modal -->
    <TobiModal
      :open="isBanned"
      :dismissible="false"
      title="🔒 Tài khoản bị khóa">
      <template #body>
        <div class="space-y-4">
          <p class="text-foreground">
            Tài khoản của bạn đã bị khóa do vi phạm chính sách bảo mật.
          </p>
          <p class="text-muted text-sm">
            Vui lòng liên hệ quản trị viên cấp cao để được hỗ trợ mở khóa tài
            khoản.
          </p>
        </div>
      </template>
      <template #footer>
        <TobiButton color="primary" @click="forceLogout">
          Đăng xuất
        </TobiButton>
      </template>
    </TobiModal>
  </div>
</template>

<script setup lang="ts">
import NotificationDropdown from "~/components/molecules/NotificationDropdown.vue";

const authStore = useAuthStore();
const { connect, disconnect, onAccountBanned } = useSocket();
const { isBanned, setBanned } = useBannedUser();

// Connect socket when layout mounts
onMounted(async () => {
  if (authStore.token) {
    connect();
    // Wait for next tick to ensure socket is created before registering listener
    await nextTick();
    onAccountBanned(() => {
      setBanned(true);
    });
  }
});

onUnmounted(() => {
  disconnect();
});

const handleLogout = () => {
  disconnect();
  authStore.logout();
};

const forceLogout = () => {
  setBanned(false);
  disconnect();
  authStore.logout();
  navigateTo("/login");
};
</script>
