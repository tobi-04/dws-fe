<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "user",
});

// Redirect to products page
const router = useRouter();
onMounted(() => {
  router.replace("/user/products");
});
</script>
