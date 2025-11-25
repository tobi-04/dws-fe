<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
      <h2 class="text-3xl font-bold text-foreground">Quản lý sản phẩm</h2>
      <div class="flex flex-wrap gap-3">
        <!-- Search & Filter -->
        <div class="flex gap-x-2">
          <TobiInput
            v-model="searchQuery"
            placeholder="Tìm kiếm sản phẩm..."
            class="w-64 p-0"
            size="lg"
            :ui="{
              base: 'h-full',
            }"
            @input="handleSearch" />
          <TobiSelect
            v-model="statusFilter"
            :items="statusOptions"
            placeholder="Trạng thái"
            class="w-40 h-full"
            @update:model-value="handleFilter" />
        </div>

        <!-- View Toggle -->
        <div class="flex border border-muted rounded-lg overflow-hidden">
          <button
            class="px-4 py-2 transition-colors"
            :class="
              viewMode === 'grid'
                ? 'bg-muted text-primary'
                : 'bg-white text-muted hover:bg-muted'
            "
            @click="viewMode = 'grid'">
            <TobiIcon name="i-lucide-grid-3x3" class="w-5 h-5" />
          </button>
          <button
            class="px-4 py-2 border-l border-muted transition-colors"
            :class="
              viewMode === 'table'
                ? 'bg-muted text-primary'
                : 'bg-white text-muted hover:bg-muted'
            "
            @click="viewMode = 'table'">
            <TobiIcon name="i-lucide-list" class="w-5 h-5" />
          </button>
        </div>

        <ProductFormModal
          v-model="showModal"
          :mode="modalMode"
          :product="selectedProduct"
          @success="handleModalSuccess">
          <template #btn>
            <TobiButton @click="openCreateModal">
              <TobiIcon name="i-lucide-plus" class="w-5 h-5 mr-2" />
              Tạo sản phẩm
            </TobiButton>
          </template>
        </ProductFormModal>

        <TobiButton variant="outline" @click="showImportModal = true">
          <TobiIcon name="i-lucide-upload" class="w-5 h-5 mr-2" />
          Import Excel
        </TobiButton>

        <ImportProductsModal
          v-model="showImportModal"
          @success="handleModalSuccess" />
      </div>
    </div>

    <!-- Bulk Actions -->
    <div
      v-if="selectedIds.length > 0"
      class="mb-4 p-2 bg-muted/50 rounded-lg flex items-center justify-between">
      <span class="text-sm font-medium ml-2"
        >Đã chọn {{ selectedIds.length }} sản phẩm</span
      >
      <div class="flex gap-2">
        <TobiButton
          size="sm"
          color="warning"
          variant="soft"
          @click="handleBulkSoftDelete">
          <TobiIcon name="i-lucide-trash" class="w-4 h-4 mr-2" />
          Xóa mềm
        </TobiButton>
        <TobiButton
          size="sm"
          color="error"
          variant="soft"
          @click="handleBulkHardDelete">
          <TobiIcon name="i-lucide-trash-2" class="w-4 h-4 mr-2" />
          Xóa cứng
        </TobiButton>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'">
      <div
        v-if="productStore.loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCardSkeleton v-for="i in 12" :key="i" />
      </div>

      <div
        v-else-if="productStore.products.length === 0"
        class="text-center py-12">
        <TobiIcon
          name="i-lucide-package-x"
          class="w-16 h-16 mx-auto text-muted mb-4" />
        <p class="text-muted">Chưa có sản phẩm nào</p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in productStore.products"
          :key="product.id"
          :product="product"
          @view="viewProduct"
          @edit="openEditModal"
          @delete="handleDelete" />
      </div>
    </div>

    <!-- Table View -->
    <TobiCard v-else>
      <div class="overflow-x-auto">
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
                Trạng thái
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Ngày tạo
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-secondary">
            <template v-if="productStore.loading">
              <ProductTableRowSkeleton v-for="i in 12" :key="i" />
            </template>

            <template v-else>
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
                    <img
                      v-if="product.imageUrl"
                      :src="product.imageUrl"
                      :alt="product.name"
                      class="w-12 h-12 rounded object-cover cursor-pointer"
                      @click="viewProduct(product.id)" />
                    <div class="w-12 h-12 bg-muted rounded" v-else></div>
                    <span class="font-medium text-foreground">{{
                      product.name
                    }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <TobiBadge :color="getStatusColor(product.status)">
                    {{ getStatusLabel(product.status) }}
                  </TobiBadge>
                </td>
                <td class="px-6 py-4 text-sm text-muted">
                  {{ new Date(product.createdAt).toLocaleDateString("vi-VN") }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <ProductFormModal
                      v-model="showModal"
                      :mode="modalMode"
                      :product="selectedProduct"
                      @success="handleModalSuccess">
                      <template #btn>
                        <TobiButton
                          size="sm"
                          variant="soft"
                          @click="openEditModal(product)">
                          <TobiIcon name="i-lucide-edit" class="w-4 h-4" />
                          Sửa
                        </TobiButton>
                      </template>
                    </ProductFormModal>
                    <TobiButton
                      size="sm"
                      color="error"
                      variant="soft"
                      @click="handleDelete(product.id)">
                      <TobiIcon name="i-lucide-trash-2" class="w-4 h-4" />
                    </TobiButton>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </TobiCard>

    <!-- Pagination -->
    <div
      v-if="productStore.meta && !productStore.loading"
      class="mt-6 flex justify-between items-center">
      <div class="text-sm text-muted">
        Hiển thị {{ productStore.products.length }} /
        {{ productStore.meta.total }} sản phẩm
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

    <!-- Delete Confirmation Dialog -->
    <TobiModal
      :open="showDeleteDialog"
      @update:open="(v) => (showDeleteDialog = v)"
      title="Xác nhận xóa sản phẩm">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            Bạn muốn xóa sản phẩm này như thế nào?
          </p>
          <div class="space-y-2">
            <div
              class="p-3 border border-muted rounded-lg hover:bg-muted cursor-pointer transition-colors"
              @click="confirmDelete('soft')">
              <div class="font-semibold text-foreground">
                Xóa mềm (Soft Delete)
              </div>
              <div class="text-xs text-muted">
                Sản phẩm sẽ được chuyển vào thùng rác và có thể khôi phục
              </div>
            </div>
            <div
              class="p-3 border border-error rounded-lg hover:bg-error/10 cursor-pointer transition-colors"
              @click="confirmDelete('hard')">
              <div class="font-semibold text-error">Xóa cứng (Hard Delete)</div>
              <div class="text-xs text-muted">
                Sản phẩm sẽ bị xóa vĩnh viễn và không thể khôi phục
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <TobiButton variant="outline" @click="showDeleteDialog = false">
          Hủy
        </TobiButton>
      </template>
    </TobiModal>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types";
import ProductCard from "~/components/molecules/ProductCard.vue";
import ProductCardSkeleton from "~/components/molecules/ProductCardSkeleton.vue";
import ProductTableRowSkeleton from "~/components/molecules/ProductTableRowSkeleton.vue";
import ProductFormModal from "~/components/organisms/ProductFormModal.vue";
import ImportProductsModal from "~/components/organisms/ImportProductsModal.vue";

definePageMeta({
  middleware: "admin",
  layout: "admin",
});

const productStore = useProductStore();
const router = useRouter();

const toast = useToast();

const viewMode = ref<"grid" | "table">("grid");
const showModal = ref(false);
const showImportModal = ref(false);
const modalMode = ref<"create" | "edit">("create");
const selectedProduct = ref<Product | null>(null);
const showDeleteDialog = ref(false);
const productToDelete = ref<string | null>(null);
const searchQuery = ref("");
const statusFilter = ref("");
const selectedIds = ref<string[]>([]);

const statusOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "PUBLISHED", label: "Công khai" },
  { value: "PRIVATE", label: "Riêng tư" },
  { value: "WHITELIST", label: "Whitelist" },
];

onMounted(async () => {
  await productStore.fetchProducts(1, 12);
});

const changePage = async (page: number) => {
  await productStore.fetchProducts(
    page,
    12,
    searchQuery.value,
    statusFilter.value === "ALL" ? "" : statusFilter.value
  );
  selectedIds.value = [];
};

const handleSearch = useDebounceFn(async () => {
  await productStore.fetchProducts(
    1,
    12,
    searchQuery.value,
    statusFilter.value === "ALL" ? "" : statusFilter.value
  );
  selectedIds.value = [];
}, 300);

const handleFilter = async () => {
  await productStore.fetchProducts(
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

const handleBulkSoftDelete = () => {
  productToDelete.value = "BULK"; // Special flag for bulk
  showDeleteDialog.value = true;
};

const handleBulkHardDelete = () => {
  productToDelete.value = "BULK_HARD"; // Special flag for bulk hard
  showDeleteDialog.value = true;
};

const openCreateModal = () => {
  modalMode.value = "create";
  selectedProduct.value = null;
  showModal.value = true;
};

const openEditModal = (product: Product) => {
  modalMode.value = "edit";
  selectedProduct.value = product;
  showModal.value = true;
};

const viewProduct = (id: string) => {
  router.push(`/admin/products/${id}`);
};

const handleDelete = (id: string) => {
  productToDelete.value = id;
  showDeleteDialog.value = true;
};

const confirmDelete = async (type: "soft" | "hard") => {
  if (!productToDelete.value) return;

  showDeleteDialog.value = false;

  try {
    if (
      productToDelete.value === "BULK" ||
      productToDelete.value === "BULK_HARD"
    ) {
      const isHard = productToDelete.value === "BULK_HARD" || type === "hard";
      if (isHard) {
        await productStore.bulkHardDeleteProducts(selectedIds.value);
        toast.add({
          title: "Xóa vĩnh viễn thành công",
          description: `Đã xóa ${selectedIds.value.length} sản phẩm`,
          color: "success",
          icon: "i-lucide-check-circle",
        });
      } else {
        await productStore.bulkSoftDeleteProducts(selectedIds.value);
        toast.add({
          title: "Xóa thành công",
          description: `Đã chuyển ${selectedIds.value.length} sản phẩm vào thùng rác`,
          color: "success",
          icon: "i-lucide-check-circle",
        });
      }
      selectedIds.value = [];
    } else {
      if (type === "soft") {
        await productStore.deleteProduct(productToDelete.value);
        toast.add({
          title: "Xóa thành công",
          description: "Sản phẩm đã được chuyển vào thùng rác",
          color: "success",
          icon: "i-lucide-check-circle",
        });
      } else {
        await productStore.hardDeleteProduct(productToDelete.value);
        toast.add({
          title: "Xóa vĩnh viễn thành công",
          description: "Sản phẩm đã được xóa khỏi hệ thống",
          color: "success",
          icon: "i-lucide-check-circle",
        });
      }
    }
  } catch (error) {
    console.error("Xóa sản phẩm thất bại:", error);
    toast.add({
      title: "Xóa sản phẩm thất bại",
      description: error instanceof Error ? error.message : "Vui lòng thử lại",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    productToDelete.value = null;
  }
};

const handleModalSuccess = async () => {
  await productStore.fetchProducts(
    productStore.meta?.page || 1,
    12,
    searchQuery.value,
    statusFilter.value === "ALL" ? "" : statusFilter.value
  );
  showModal.value = false;
};

const getStatusColor = (status: string) => {
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
};

const getStatusLabel = (status: string) => {
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
};
</script>
