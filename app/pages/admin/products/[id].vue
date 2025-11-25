<template>
  <div>
    <!-- Skeleton Loading -->
    <div v-if="productStore.loading" class="space-y-6">
      <div class="flex gap-4 items-center">
        <div class="h-8 w-8 bg-muted rounded animate-pulse" />
        <div class="h-8 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div class="rounded-lg p-6 space-y-4">
        <div class="aspect-video bg-muted rounded-lg animate-pulse" />
        <div class="space-y-2">
          <div class="h-4 bg-muted rounded animate-pulse" />
          <div class="h-4 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="space-y-6">
      <!-- Back Button -->
      <button
        class="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
        @click="$router.back()">
        <TobiIcon name="i-lucide-arrow-left" class="w-5 h-5" />
        <span>Quay lại</span>
      </button>

      <TobiCard>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Image -->
          <div>
            <div
              class="aspect-square bg-muted rounded-lg overflow-hidden cursor-zoom-in relative"
              @click="showImageZoom = true"
              @contextmenu.prevent>
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.name"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                draggable="false" />
              <div
                class="absolute inset-0 flex items-center justify-center bg-secondary/0 hover:bg-secondary/20 transition-colors">
                <TobiIcon
                  name="i-lucide-zoom-in"
                  class="w-8 h-8 text-muted opacity-0 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="space-y-6">
            <div>
              <h1 class="text-3xl font-bold text-foreground mb-2">
                {{ product.name }}
              </h1>
              <div class="flex items-center gap-3">
                <TobiBadge :color="getStatusColor(product.status)" size="lg">
                  {{ getStatusLabel(product.status) }}
                </TobiBadge>
                <!-- Reaction Count -->
                <div class="flex items-center gap-1 text-muted">
                  <TobiIcon name="i-lucide-heart" class="w-4 h-4 text-error" />
                  <span class="text-sm">{{ reactionCount }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-muted mb-2">Thông tin</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-muted">Ngày tạo:</span>
                    <span class="font-medium">{{
                      new Date(product.createdAt).toLocaleDateString("vi-VN")
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted">Cập nhật:</span>
                    <span class="font-medium">{{
                      new Date(product.updatedAt).toLocaleDateString("vi-VN")
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted">Người sửa:</span>
                    <span class="font-medium">{{ product.updatedBy }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="
                  product.status === 'WHITELIST' &&
                  product.whitelistUserIds.length > 0
                ">
                <h3 class="text-sm font-medium text-muted mb-2">
                  Whitelist ({{ product.whitelistUserIds.length }})
                </h3>
                <div class="flex flex-wrap gap-2">
                  <TobiBadge
                    v-for="userId in product.whitelistUserIds"
                    :key="userId"
                    color="info">
                    {{ userId }}
                  </TobiBadge>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <TobiButton block @click="handleEdit">
                <TobiIcon name="i-lucide-edit" class="w-5 h-5 mr-2" />
                Chỉnh sửa
              </TobiButton>
              <TobiButton color="error" variant="outline" @click="handleDelete">
                <TobiIcon name="i-lucide-trash-2" class="w-5 h-5 mr-2" />
                Xóa
              </TobiButton>
            </div>
          </div>
        </div>
      </TobiCard>

      <!-- Reviews Management Section -->
      <TobiCard>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-foreground">
            Quản lý đánh giá ({{ reviews.length }})
          </h2>
        </div>

        <!-- Reviews Loading -->
        <div v-if="loadingReviews" class="space-y-4">
          <div
            v-for="i in 3"
            :key="i"
            class="p-4 border border-border rounded-lg space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div class="space-y-2 flex-1">
                <div class="h-4 w-32 bg-muted rounded animate-pulse" />
                <div class="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div class="h-16 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="reviews.length === 0"
          class="text-center py-8 text-muted">
          <TobiIcon
            name="i-lucide-message-circle"
            class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có đánh giá nào cho sản phẩm này</p>
        </div>

        <!-- Reviews List -->
        <div v-else class="space-y-4">
          <ReviewCard
            v-for="review in reviews"
            :key="review.id"
            :review="review"
            :is-admin="true"
            :current-user-id="authStore.user?.id"
            @hide="handleHideReview"
            @show="handleShowReview"
            @like="handleLikeReview"
            @delete-as-admin="handleAdminDeleteReview" />
        </div>

        <!-- Load More -->
        <div
          v-if="reviewMeta && reviewMeta.page < reviewMeta.totalPages"
          class="flex justify-center mt-4">
          <TobiButton variant="outline" @click="loadMoreReviews">
            Xem thêm
          </TobiButton>
        </div>
      </TobiCard>
    </div>

    <!-- Image Zoomer Modal -->
    <ImageZoomer
      v-model="showImageZoom"
      :image-src="product?.imageUrl || ''"
      :alt="product?.name || ''"
      :title="product?.name || 'Xem ảnh'"
      :watermark-text="authStore.user?.username || 'User'" />

    <!-- Delete Confirmation Dialog -->
    <TobiModal
      :open="showDeleteDialog"
      title="Xác nhận xóa sản phẩm"
      @update:open="(v) => (showDeleteDialog = v)">
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

    <!-- Edit Modal -->
    <ProductFormModal
      v-model="showEditModal"
      mode="edit"
      :product="product"
      @success="handleEditSuccess" />
  </div>
</template>

<script setup lang="ts">
import ProductFormModal from "~/components/organisms/ProductFormModal.vue";
import ImageZoomer from "~/components/organisms/ImageZoomer.vue";
import ReviewCard from "~/components/molecules/ReviewCard.vue";
import type { Review, PaginationMeta } from "~/types";

definePageMeta({
  middleware: "admin",
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const authStore = useAuthStore();
const {
  connect,
  joinProductRoom,
  leaveProductRoom,
  onNewReview,
  onReviewUpdated,
  onReviewDeleted,
  onReviewVisibilityChanged,
  onProductReactionUpdated,
} = useSocket();

const product = computed(() => productStore.currentProduct);
const showImageZoom = ref(false);
const showEditModal = ref(false);
const showDeleteDialog = ref(false);
const toast = useToast();

// Reviews state
const reviews = ref<Review[]>([]);
const reviewMeta = ref<PaginationMeta | null>(null);
const loadingReviews = ref(false);
const reactionCount = ref(0);

// WebSocket cleanup functions
let unsubNewReview: (() => void) | undefined;
let unsubReviewUpdated: (() => void) | undefined;
let unsubReviewDeleted: (() => void) | undefined;
let unsubVisibilityChanged: (() => void) | undefined;
let unsubReactionUpdated: (() => void) | undefined;

// Helper function to recursively update a review in the tree
const updateReviewInTree = (
  reviewList: Review[],
  reviewId: string,
  updateFn: (review: Review) => void
): boolean => {
  for (const review of reviewList) {
    if (review.id === reviewId) {
      updateFn(review);
      return true;
    }
    if (review.replies && review.replies.length > 0) {
      if (updateReviewInTree(review.replies, reviewId, updateFn)) {
        return true;
      }
    }
  }
  return false;
};

// Helper function to recursively delete a review from the tree
const deleteReviewFromTree = (
  reviewList: Review[],
  reviewId: string
): Review[] => {
  return reviewList.filter((review) => {
    if (review.id === reviewId) {
      return false;
    }
    if (review.replies && review.replies.length > 0) {
      review.replies = deleteReviewFromTree(review.replies, reviewId);
    }
    return true;
  });
};

onMounted(async () => {
  const id = route.params.id as string;
  await productStore.fetchProduct(id);
  await Promise.all([fetchReviews(), fetchReactionCount()]);

  // Connect to WebSocket and join product room
  connect();
  joinProductRoom(id);

  // Set up WebSocket listeners
  unsubNewReview = onNewReview((newReview: Review) => {
    const exists = reviews.value.some((r) => r.id === newReview.id);
    if (!exists && !newReview.parentId) {
      reviews.value.unshift(newReview);
    } else if (newReview.parentId) {
      updateReviewInTree(reviews.value, newReview.parentId, (parent) => {
        if (!parent.replies) parent.replies = [];
        const replyExists = parent.replies.some((r) => r.id === newReview.id);
        if (!replyExists) {
          parent.replies.push(newReview);
        }
      });
    }
  });

  unsubReviewUpdated = onReviewUpdated((updatedReview: Review) => {
    updateReviewInTree(reviews.value, updatedReview.id, (review) => {
      Object.assign(review, updatedReview);
    });
  });

  unsubReviewDeleted = onReviewDeleted(({ reviewId }: { reviewId: string }) => {
    reviews.value = deleteReviewFromTree(reviews.value, reviewId);
  });

  unsubVisibilityChanged = onReviewVisibilityChanged(
    ({ reviewId, isHidden }: { reviewId: string; isHidden: boolean }) => {
      updateReviewInTree(reviews.value, reviewId, (review) => {
        review.isHidden = isHidden;
      });
    }
  );

  unsubReactionUpdated = onProductReactionUpdated((data: { count: number }) => {
    reactionCount.value = data.count;
  });
});

onUnmounted(() => {
  const id = route.params.id as string;
  leaveProductRoom(id);

  // Clean up WebSocket listeners
  unsubNewReview?.();
  unsubReviewUpdated?.();
  unsubReviewDeleted?.();
  unsubVisibilityChanged?.();
  unsubReactionUpdated?.();
});

const fetchReactionCount = async () => {
  const productId = route.params.id as string;
  try {
    const response = await $fetch<{ count: number }>(
      `${useRuntimeConfig().public.apiBaseUrl}/products/${productId}/reaction`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    reactionCount.value = response.count;
  } catch (error) {
    console.error("Failed to fetch reaction count:", error);
  }
};

const fetchReviews = async (page = 1) => {
  const productId = route.params.id as string;
  loadingReviews.value = true;
  try {
    const response = await $fetch<{ items: Review[]; meta: PaginationMeta }>(
      `${useRuntimeConfig().public.apiBaseUrl}/reviews/product/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        query: { page, limit: 10, includeHidden: true },
      }
    );
    if (page === 1) {
      reviews.value = response.items;
    } else {
      reviews.value.push(...response.items);
    }
    reviewMeta.value = response.meta;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  } finally {
    loadingReviews.value = false;
  }
};

const loadMoreReviews = async () => {
  if (reviewMeta.value) {
    await fetchReviews(reviewMeta.value.page + 1);
  }
};

const handleHideReview = async (reviewId: string) => {
  try {
    await $fetch(
      `${useRuntimeConfig().public.apiBaseUrl}/reviews/${reviewId}/hide`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const index = reviews.value.findIndex((r) => r.id === reviewId);
    if (index !== -1) {
      const review = reviews.value[index];
      if (review) {
        review.isHidden = true;
      }
    }
    toast.add({
      title: "Thành công",
      description: "Đã ẩn đánh giá",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể ẩn đánh giá",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};

const handleShowReview = async (reviewId: string) => {
  try {
    await $fetch(
      `${useRuntimeConfig().public.apiBaseUrl}/reviews/${reviewId}/show`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const index = reviews.value.findIndex((r) => r.id === reviewId);
    if (index !== -1) {
      const review = reviews.value[index];
      if (review) {
        review.isHidden = false;
      }
    }
    toast.add({
      title: "Thành công",
      description: "Đã hiện đánh giá",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể hiện đánh giá",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};

const handleLikeReview = async (reviewId: string, isLike: boolean) => {
  try {
    const response = await $fetch<{
      likes: number;
      dislikes: number;
      userReaction: boolean | null;
    }>(`${useRuntimeConfig().public.apiBaseUrl}/reviews/${reviewId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: { isLike },
    });
    // Update the review in the tree (handles both parent reviews and replies)
    updateReviewInTree(reviews.value, reviewId, (review) => {
      review.likes = response.likes;
      review.dislikes = response.dislikes;
      review.userReaction = response.userReaction;
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

const handleAdminDeleteReview = async (reviewId: string) => {
  try {
    await $fetch(
      `${useRuntimeConfig().public.apiBaseUrl}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    reviews.value = deleteReviewFromTree(reviews.value, reviewId);
    toast.add({
      title: "Thành công",
      description: "Đã xóa đánh giá",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể xóa đánh giá",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};

const handleEdit = () => {
  showEditModal.value = true;
};

const handleEditSuccess = async () => {
  const id = route.params.id as string;
  await productStore.fetchProduct(id);
};

const handleDelete = () => {
  showDeleteDialog.value = true;
};

const confirmDelete = async (type: "soft" | "hard") => {
  if (!product.value) return;

  showDeleteDialog.value = false;

  try {
    if (type === "soft") {
      await productStore.deleteProduct(product.value.id);
      toast.add({
        title: "Xóa thành công",
        description: "Sản phẩm đã được chuyển vào thùng rác",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      await productStore.hardDeleteProduct(product.value.id);
      toast.add({
        title: "Xóa vĩnh viễn thành công",
        description: "Sản phẩm đã được xóa khỏi hệ thống",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    }
    router.push("/admin/products");
  } catch (error) {
    toast.add({
      title: "Xóa sản phẩm thất bại",
      description: error instanceof Error ? error.message : "Vui lòng thử lại",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
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
