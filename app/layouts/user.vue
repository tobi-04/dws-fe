<template>
  <div class="min-h-screen bg-background">
    <!-- Banned User Modal - Cannot be dismissed -->
    <div
      v-if="isBanned"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-muted">
      <div class="bg-background rounded-lg p-8 max-w-md mx-4 text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
          <TobiIcon name="i-lucide-ban" class="w-8 h-8 text-error" />
        </div>
        <h2 class="text-xl font-bold text-foreground mb-2">
          Tài khoản đã bị khóa
        </h2>
        <p class="text-muted mb-6">
          Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ admin
          để được hỗ trợ.
        </p>
        <TobiButton color="primary" @click="handleLogoutBanned">
          Đăng xuất
        </TobiButton>
      </div>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-muted">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-8">
          <NuxtLink to="/user" class="text-2xl font-bold text-primary">
            Product Store
          </NuxtLink>
          <nav class="hidden md:flex items-center gap-4">
            <NuxtLink
              to="/user/products"
              class="text-sm font-medium text-muted hover:text-foreground transition-colors"
              active-class="text-foreground">
              <TobiIcon name="i-lucide-package" class="w-4 h-4 inline mr-1" />
              Sản phẩm
            </NuxtLink>
            <NuxtLink
              to="/user/saved"
              class="text-sm font-medium text-muted hover:text-foreground transition-colors"
              active-class="text-foreground">
              <TobiIcon name="i-lucide-bookmark" class="w-4 h-4 inline mr-1" />
              Đã lưu
            </NuxtLink>
          </nav>
        </div>
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

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-muted mt-auto">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted">
        © {{ new Date().getFullYear() }} Product Store. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import NotificationDropdown from "~/components/molecules/NotificationDropdown.vue";

const authStore = useAuthStore();
const { connect, disconnect, onAccountBanned } = useSocket();
const { isBanned, setBanned } = useBannedUser();

// Connect socket when layout mounts
onMounted(() => {
  if (authStore.token) {
    connect();
  }

  // Listen for real-time ban event from socket
  onAccountBanned(() => {
    setBanned(true);
  });
});

onUnmounted(() => {
  disconnect();
});

const handleLogout = () => {
  disconnect();
  authStore.logout();
};

const handleLogoutBanned = () => {
  setBanned(false);
  disconnect();
  authStore.logout();
};
</script>
