<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Sản phẩm</h1>
        <p class="text-muted mt-1">Khám phá các sản phẩm của chúng tôi</p>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1 relative">
        <TobiInput
          v-model="searchQuery"
          placeholder="Tìm kiếm sản phẩm..."
          :ui="{ leadingIcon: 'pl-10' }">
          <template #leading>
            <TobiIcon name="i-lucide-search" class="w-5 h-5 text-muted" />
          </template>
        </TobiInput>
      </div>
      <TobiSelect
        v-model="selectedStatus"
        :items="statusOptions"
        placeholder="Lọc theo trạng thái"
        class="w-full sm:w-48" />
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCardSkeleton v-for="i in 8" :key="i" />
    </div>

    <!-- Empty State -->
    <TobiCard v-else-if="products.length === 0" class="text-center py-16">
      <TobiIcon
        name="i-lucide-package-x"
        class="w-16 h-16 text-muted mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-foreground">
        Không tìm thấy sản phẩm
      </h3>
      <p class="text-muted mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
    </TobiCard>

    <!-- Products Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <UserProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @click="goToDetail(product.id)" />
    </div>

    <!-- Pagination -->
    <div v-if="meta && meta.totalPages > 1" class="flex justify-center mt-8">
      <TobiPagination
        v-model:page="currentPage"
        :total="meta.total"
        :items-per-page="meta.limit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import UserProductCard from "~/components/molecules/UserProductCard.vue";
import ProductCardSkeleton from "~/components/molecules/ProductCardSkeleton.vue";

definePageMeta({
  layout: "user",
});

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();

// Search and filter state
const searchQuery = ref((route.query.search as string) || "");
const selectedStatus = ref((route.query.status as string) || "");
const currentPage = ref(Number(route.query.page) || 1);

const statusOptions = [
  { label: "Tất cả", value: "ALL" },
  { label: "Công khai", value: "PUBLISHED" },
  { label: "Riêng tư", value: "PRIVATE" },
  { label: "Whitelist", value: "WHITELIST" },
];

const products = computed(() => productStore.products);
const meta = computed(() => productStore.meta);
const loading = computed(() => productStore.loading);

// Debounced search
const debouncedSearch = useDebounce(searchQuery, 500);

// Watch for changes and update URL + fetch
watch(
  [debouncedSearch, selectedStatus, currentPage],
  async ([search, status, page]) => {
    // Update URL
    const query: Record<string, string | number> = { page };
    if (search) query.search = search;
    if (status && status !== "ALL") query.status = status;

    router.replace({ query });

    // Fetch products
    await fetchProducts();
  }
);

// Reset page when search or status changes
watch([debouncedSearch, selectedStatus], () => {
  currentPage.value = 1;
});

const fetchProducts = async () => {
  await productStore.fetchProducts(
    currentPage.value,
    12,
    debouncedSearch.value || undefined,
    selectedStatus.value === "ALL" ? undefined : selectedStatus.value
  );
};

const goToDetail = (id: string) => {
  router.push(`/user/products/${id}`);
};

// Initial fetch
onMounted(async () => {
  try {
    await fetchProducts();
  } catch (error) {
    console.error("Error in products page onMounted:", error);
  }
});
</script>
