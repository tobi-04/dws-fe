<template>
  <div class="min-h-screen bg-background">
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
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
};
</script>
