<template>
  <div
    class="rounded-lg border border-muted shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div
      class="aspect-square overflow-hidden bg-muted cursor-pointer"
      @contextmenu.prevent
      @click="$emit('view', product.id)">
      <CanvasImage
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        container-class="w-full h-full"
        canvas-class="hover:scale-105 transition-transform duration-300" />
    </div>

    <div class="p-4">
      <h3 class="font-semibold text-foreground mb-2 truncate">
        {{ product.name }}
      </h3>

      <div class="flex items-center justify-between mb-3">
        <TobiBadge :color="statusColor">
          {{ statusLabel }}
        </TobiBadge>
        <TobiBadge
          v-if="product.whitelistUserIds.length > 0"
          color="info"
          variant="soft">
          {{ product.whitelistUserIds.length }} users
        </TobiBadge>
      </div>

      <div class="flex gap-2">
        <ProductFormModal
          v-model="showModal"
          :mode="modalMode"
          :product="selectedProduct"
          @success="handleModalSuccess">
          <template #btn>
            <TobiButton size="sm" variant="soft" block @click="openEditModal">
              <TobiIcon name="i-lucide-edit" class="w-4 h-4" />
              Sửa
            </TobiButton>
          </template>
        </ProductFormModal>

        <TobiButton
          size="sm"
          color="error"
          variant="soft"
          @click="$emit('delete', product.id)">
          <TobiIcon name="i-lucide-trash-2" class="w-4 h-4" />
        </TobiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types";
import ProductFormModal from "../organisms/ProductFormModal.vue";
import CanvasImage from "./CanvasImage.vue";
import { ref, computed } from "vue"; // Import ref and computed

interface Props {
  product: Product;
}

const props = defineProps<Props>(); // Assign defineProps to a variable

defineEmits<{
  view: [id: string];
  edit: [product: Product];
  delete: [id: string];
  success: [];
}>();

// Add state for modal
const showModal = ref(false);
const modalMode = ref<"create" | "edit">("edit");
const selectedProduct = ref<Product | null>(null);

function openEditModal() {
  selectedProduct.value = props.product;
  modalMode.value = "edit";
  showModal.value = true;
}

function handleModalSuccess() {
  // Close modal and notify parent to refresh list
  showModal.value = false;
  selectedProduct.value = null;
}

const statusColor = computed(() => {
  const status = props.product.status; // Access prop directly
  switch (status) {
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
  const status = props.product.status; // Access prop directly
  switch (status) {
    case "PUBLISHED":
      return "Công khai";
    case "PRIVATE":
      return "Riêng tư";
    case "WHITELIST":
      return "Whitelist";
    default:
      return status;
  }
});
</script>
