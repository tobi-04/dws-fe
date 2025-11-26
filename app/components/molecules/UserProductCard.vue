<template>
  <TobiCard
    class="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    :ui="{ body: 'p-0' }"
    @click="$emit('click')">
    <div
      class="aspect-square overflow-hidden bg-muted relative"
      @contextmenu.prevent>
      <CanvasImage
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        container-class="w-full h-full"
        canvas-class="hover:scale-105 transition-transform duration-300" />
      <!-- Status badge overlay -->
      <div class="absolute top-2 right-2">
        <TobiBadge :color="statusColor" size="sm">
          {{ statusLabel }}
        </TobiBadge>
      </div>
    </div>

    <div class="p-4">
      <h3 class="font-semibold text-foreground mb-1 truncate">
        {{ product.name }}
      </h3>
      <p class="text-sm text-muted">
        {{ formatDate(product.createdAt) }}
      </p>
    </div>
  </TobiCard>
</template>

<script setup lang="ts">
import type { Product } from "~/types";
import CanvasImage from "./CanvasImage.vue";

interface Props {
  product: Product;
}

const props = defineProps<Props>();

defineEmits<{
  click: [];
}>();

const statusColor = computed(() => {
  switch (props.product.status) {
    case "PUBLISHED":
      return "success";
    case "PRIVATE":
      return "warning";
    case "WHITELIST":
      return "info";
    default:
      return "secondary";
  }
});

const statusLabel = computed(() => {
  switch (props.product.status) {
    case "PUBLISHED":
      return "Công khai";
    case "PRIVATE":
      return "Riêng tư";
    case "WHITELIST":
      return "Whitelist";
    default:
      return props.product.status;
  }
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN");
};
</script>
