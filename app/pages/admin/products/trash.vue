<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-3xl font-bold text-foreground">Thùng rác</h2>
      <div class="flex gap-2">
        <TobiInput
          v-model="searchQuery"
          placeholder="Tìm kiếm..."
          class="w-64"
          @input="handleSearch" />
        <TobiSelect
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="Trạng thái"
          class="w-40"
          @update:modelValue="handleFilter" />
        <TobiButton
          v-if="selectedIds.length > 0"
          color="error"
          variant="soft"
          class="mr-2"
          @click="handleBulkHardDelete">
          <TobiIcon name="i-lucide-trash-2" class="w-5 h-5 mr-2" />
          Xóa vĩnh viễn ({{ selectedIds.length }})
        </TobiButton>
        <TobiButton v-if="selectedIds.length > 0" @click="handleBulkRestore">
          <TobiIcon name="i-lucide-archive-restore" class="w-5 h-5 mr-2" />
          Khôi phục ({{ selectedIds.length }})
        </TobiButton>
      </div>
    </div>

    <TobiCard>
      <!-- Skeleton Loading -->
      <div v-if="productStore.loading" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted border-b">
            <tr>
              <th class="px-6 py-3 w-12"></th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Sản phẩm
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Ngày xóa
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-secondary">
            <tr v-for="i in 12" :key="i" class="border-b">
              <td class="px-6 py-4">
                <div class="w-4 h-4 bg-muted rounded animate-pulse"></div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-muted rounded animate-pulse"></div>
                  <div class="h-4 w-32 bg-muted rounded animate-pulse"></div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 w-24 bg-muted rounded animate-pulse"></div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <div class="h-8 w-24 bg-muted rounded animate-pulse"></div>
                  <div class="h-8 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="productStore.products.length === 0"
        class="text-center py-12">
        <TobiIcon
          name="i-lucide-inbox"
          class="w-16 h-16 mx-auto text-muted mb-4" />
        <p class="text-muted">Thùng rác trống</p>
      </div>

      <!-- Trash Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted border-b">
            <tr>
              <th class="px-6 py-3 w-12">
                <input
                  type="checkbox"
                  class="rounded border-secondary"
                  :checked="
                    selectedIds.length === productStore.products.length &&
                    productStore.products.length > 0
                  "
                  @change="toggleSelectAll" />
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Sản phẩm
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Ngày xóa
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-secondary">
            <tr
              v-for="product in productStore.products"
              :key="product.id"
              class="hover:bg-muted">
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  class="rounded border-secondary"
                  :checked="selectedIds.includes(product.id)"
                  @change="toggleSelect(product.id)" />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <span class="font-medium text-foreground">{{
                    product.name
                  }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-muted">
                {{
                  product.deletedAt
                    ? new Date(product.deletedAt).toLocaleDateString("vi-VN")
                    : "-"
                }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <TobiButton
                    size="sm"
                    color="success"
                    variant="soft"
                    @click="handleRestore([product.id])">
                    <TobiIcon name="i-lucide-archive-restore" class="w-4 h-4" />
                    Khôi phục
                  </TobiButton>
                  <TobiButton
                    size="sm"
                    color="error"
                    variant="soft"
                    @click="handleHardDelete(product.id)">
                    <TobiIcon name="i-lucide-trash-2" class="w-4 h-4" />
                    Xóa vĩnh viễn
                  </TobiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="productStore.meta && !productStore.loading"
        class="mt-6 flex justify-between items-center">
        <div class="text-sm text-muted">
          Hiển thị {{ productStore.products.length }} /
          {{ productStore.meta.total }} sản phẩm đã xóa
        </div>
        <div class="flex gap-2">
          <TobiButton
            :disabled="productStore.meta.page <= 1"
            variant="outline"
            size="sm"
            @click="changePage(productStore.meta.page - 1)">
            Trước
          </TobiButton>
          <span class="px-4 py-2 text-sm">
            Trang {{ productStore.meta.page }} /
            {{ productStore.meta.totalPages }}
          </span>
          <TobiButton
            :disabled="productStore.meta.page >= productStore.meta.totalPages"
            variant="outline"
            size="sm"
            @click="changePage(productStore.meta.page + 1)">
            Sau
          </TobiButton>
        </div>
      </div>
    </TobiCard>

    <TobiConfirmDialog
      v-bind="confirmConfig"
      :open="confirmIsOpen"
      @close="closeConfirm" />
  </div>
</template>

<script setup lang="ts">
import TobiConfirmDialog from "~/components/core/TobiConfirmDialog.vue";

definePageMeta({
  middleware: "admin",
  layout: "admin",
});

const productStore = useProductStore();
const {
  isOpen: confirmIsOpen,
  config: confirmConfig,
  open: openConfirm,
  close: closeConfirm,
} = useConfirmDialog();
const toast = useToast();

const selectedIds = ref<string[]>([]);
const searchQuery = ref("");
const statusFilter = ref("");

const statusOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "PUBLISHED", label: "Công khai" },
  { value: "PRIVATE", label: "Riêng tư" },
  { value: "WHITELIST", label: "Whitelist" },
];

onMounted(async () => {
  await productStore.fetchTrashedProducts();
});

const changePage = async (page: number) => {
  await productStore.fetchTrashedProducts(
    page,
    12,
    searchQuery.value,
    statusFilter.value === "ALL" ? "" : statusFilter.value
  );
  selectedIds.value = [];
};

const handleSearch = useDebounceFn(async () => {
  await productStore.fetchTrashedProducts(
    1,
    12,
    searchQuery.value,
    statusFilter.value === "ALL" ? "" : statusFilter.value
  );
  selectedIds.value = [];
}, 300);

const handleFilter = async () => {
  await productStore.fetchTrashedProducts(
    1,
    12,
    searchQuery.value,
    statusFilter.value === "ALL" ? "" : statusFilter.value
  );
  selectedIds.value = [];
};

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const toggleSelectAll = () => {
  if (selectedIds.value.length === productStore.products.length) {
    selectedIds.value = [];
  } else {
    selectedIds.value = productStore.products.map((p) => p.id);
  }
};

const handleRestore = async (ids: string[]) => {
  try {
    await productStore.restoreProducts(ids);
    selectedIds.value = [];
    toast.add({
      title: "Khôi phục thành công",
      description: `Đã khôi phục ${ids.length} sản phẩm`,
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch (error) {
    toast.add({
      title: "Khôi phục thất bại",
      description: error instanceof Error ? error.message : "Vui lòng thử lại",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};

const handleBulkRestore = () => {
  if (selectedIds.value.length > 0) {
    handleRestore(selectedIds.value);
  }
};

const handleBulkHardDelete = () => {
  if (selectedIds.value.length === 0) return;

  openConfirm({
    title: "Xóa vĩnh viễn các sản phẩm đã chọn",
    description: `Bạn có chắc muốn xóa vĩnh viễn ${selectedIds.value.length} sản phẩm này? Hành động này không thể hoàn tác!`,
    color: "error",
    confirmLabel: "Xóa vĩnh viễn",
    onConfirm: async () => {
      try {
        await productStore.bulkHardDeleteProducts(selectedIds.value);
        selectedIds.value = [];
        toast.add({
          title: "Xóa vĩnh viễn thành công",
          description: "Các sản phẩm đã được xóa khỏi hệ thống",
          color: "success",
          icon: "i-lucide-check-circle",
        });
      } catch (error) {
        toast.add({
          title: "Xóa vĩnh viễn thất bại",
          description:
            error instanceof Error ? error.message : "Vui lòng thử lại",
          color: "error",
          icon: "i-lucide-alert-circle",
        });
      }
    },
  });
};

const handleHardDelete = async (id: string) => {
  openConfirm({
    title: "Xóa vĩnh viễn sản phẩm",
    description:
      "Bạn có chắc muốn xóa vĩnh viễn sản phẩm này? Hành động này không thể hoàn tác!",
    color: "error",
    confirmLabel: "Xóa vĩnh viễn",
    onConfirm: async () => {
      try {
        await productStore.hardDeleteProduct(id);
        toast.add({
          title: "Xóa vĩnh viễn thành công",
          description: "Sản phẩm đã được xóa khỏi hệ thống",
          color: "success",
          icon: "i-lucide-check-circle",
        });
      } catch (error) {
        toast.add({
          title: "Xóa vĩnh viễn thất bại",
          description:
            error instanceof Error ? error.message : "Vui lòng thử lại",
          color: "error",
          icon: "i-lucide-alert-circle",
        });
      }
    },
  });
};
</script>
