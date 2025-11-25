<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  ssr: false,
});

const authStore = useAuthStore();

// Redirect based on role immediately
if (import.meta.client) {
  if (authStore.isAdmin) {
    navigateTo("/admin/products");
  } else {
    navigateTo("/user");
  }
}
</script>
