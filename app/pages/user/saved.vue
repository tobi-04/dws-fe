<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Sản phẩm đã lưu</h1>
        <p class="text-muted text-sm mt-1">
          Quản lý danh sách sản phẩm bạn đã đánh dấu
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <TobiTabs v-model="activeTab" :items="tabItems" class="w-full" />

    <!-- Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProductCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-16">
      <TobiIcon
        :name="activeTab === 'saved' ? 'i-lucide-bookmark' : 'i-lucide-heart'"
        class="w-16 h-16 mx-auto text-muted mb-4" />
      <h3 class="text-lg font-semibold text-foreground">
        {{
          activeTab === "saved"
            ? "Chưa có sản phẩm nào được lưu"
            : "Chưa có sản phẩm nào được yêu thích"
        }}
      </h3>
      <p class="text-muted mt-2">
        {{
          activeTab === "saved"
            ? "Hãy lưu sản phẩm để xem lại sau"
            : "Hãy thích sản phẩm để lưu vào danh sách"
        }}
      </p>
      <TobiButton class="mt-4" @click="$router.push('/user/products')">
        Khám phá sản phẩm
      </TobiButton>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UserProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :show-actions="true"
        @click="$router.push(`/user/products/${product.id}`)"
        @remove="handleRemove(product.id)">
        <template #actions>
          <TobiButton
            variant="ghost"
            size="sm"
            :color="activeTab === 'saved' ? 'warning' : 'error'"
            @click.stop="handleRemove(product.id)">
            <TobiIcon
              :name="
                activeTab === 'saved'
                  ? 'i-lucide-bookmark-minus'
                  : 'i-lucide-heart-off'
              "
              class="w-4 h-4 mr-1" />
            {{ activeTab === "saved" ? "Bỏ lưu" : "Bỏ thích" }}
          </TobiButton>
        </template>
      </UserProductCard>
    </div>

    <!-- Pagination -->
    <div v-if="meta && meta.totalPages > 1" class="flex justify-center mt-8">
      <TobiPagination
        v-model="currentPage"
        :total="meta.total"
        :items-per-page="meta.limit"
        @update:model-value="handlePageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCardSkeleton from "~/components/molecules/ProductCardSkeleton.vue";
import UserProductCard from "~/components/molecules/UserProductCard.vue";
import type { Product, PaginationMeta } from "~/types";

definePageMeta({
  layout: "user",
});

interface TabItem {
  label: string;
  value: string;
  icon: string;
}

const toast = useToast();
const activeTab = ref("saved");
const loading = ref(false);
const products = ref<Product[]>([]);
const meta = ref<PaginationMeta | null>(null);
const currentPage = ref(1);

const tabItems: TabItem[] = [
  { label: "Đã lưu", value: "saved", icon: "i-lucide-bookmark" },
  { label: "Yêu thích", value: "reacted", icon: "i-lucide-heart" },
];

const fetchProducts = async () => {
  loading.value = true;
  try {
    const endpoint = activeTab.value === "saved" ? "saved" : "reacted";
    const response = await $fetch<{ items: Product[]; meta: PaginationMeta }>(
      `${useRuntimeConfig().public.apiBaseUrl}/products/user/${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        query: { page: currentPage.value, limit: 12 },
      }
    );
    products.value = response.items;
    meta.value = response.meta;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    toast.add({
      title: "Lỗi",
      description: "Không thể tải danh sách sản phẩm",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    loading.value = false;
  }
};

const handleRemove = async (productId: string) => {
  try {
    const endpoint = activeTab.value === "saved" ? "save" : "reaction";
    await $fetch(
      `${
        useRuntimeConfig().public.apiBaseUrl
      }/products/${productId}/${endpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    products.value = products.value.filter((p) => p.id !== productId);
    toast.add({
      title: "Thành công",
      description:
        activeTab.value === "saved"
          ? "Đã bỏ lưu sản phẩm"
          : "Đã bỏ thích sản phẩm",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể thực hiện thao tác",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchProducts();
};

watch(activeTab, () => {
  currentPage.value = 1;
  fetchProducts();
});

onMounted(() => {
  fetchProducts();
});
</script>
