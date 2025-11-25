<template>
  <div class="min-h-screen bg-muted">
    <!-- Header -->
    <header class="border-b border-muted">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <div class="flex items-center gap-4">
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
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
};
</script>
