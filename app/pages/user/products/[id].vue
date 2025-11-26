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
    <div v-else-if="product" class="space-y-8">
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
              <CanvasImage
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.name"
                container-class="w-full h-full"
                canvas-class="hover:scale-105 transition-transform duration-300" />
              <div
                class="absolute inset-0 flex items-center justify-center bg-secondary/0 hover:bg-secondary/20 transition-colors pointer-events-none">
                <TobiIcon
                  name="i-lucide-zoom-in"
                  class="w-8 h-8 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
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
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-4">
              <!-- Heart Reaction -->
              <button
                class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer"
                :class="
                  reactionState.reacted
                    ? 'bg-error/10 border-error text-error'
                    : 'bg-card border-border text-muted hover:text-error hover:border-error'
                "
                @click="toggleReaction">
                <TobiIcon
                  :name="
                    reactionState.reacted ? 'i-lucide-heart' : 'i-lucide-heart'
                  "
                  class="w-5 h-5 cursor-pointer"
                  :class="reactionState.reacted ? 'fill-current' : ''" />
                <span class="font-medium">{{ reactionState.count }}</span>
              </button>

              <!-- Save/Bookmark -->
              <button
                class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer"
                :class="
                  isSaved
                    ? 'bg-warning/10 border-warning text-warning'
                    : 'bg-card border-border text-muted hover:text-warning hover:border-warning'
                "
                @click="toggleSaved">
                <TobiIcon
                  :name="isSaved ? 'i-lucide-bookmark' : 'i-lucide-bookmark'"
                  class="w-5 h-5 cursor-pointer"
                  :class="isSaved ? 'fill-current' : ''" />
                <span>{{ isSaved ? "Đã lưu" : "Lưu" }}</span>
              </button>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </TobiCard>

      <!-- Reviews Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-foreground">Đánh giá</h2>
          <span class="text-muted text-sm">{{ reviews.length }} đánh giá</span>
        </div>

        <!-- Review Form -->
        <TobiCard>
          <h3 class="text-lg font-semibold text-foreground mb-4">
            Viết đánh giá của bạn
          </h3>
          <ReviewEditor
            v-model="reviewContent"
            placeholder="Nhập đánh giá của bạn về sản phẩm..."
            :loading="submittingReview" />
          <div class="mt-4 flex justify-end">
            <TobiButton
              :loading="submittingReview"
              :disabled="!reviewContent.trim()"
              @click="submitReview">
              <TobiIcon name="i-lucide-send" class="w-4 h-4 mr-2" />
              Gửi đánh giá
            </TobiButton>
          </div>
        </TobiCard>

        <!-- Reviews List -->
        <div v-if="loadingReviews" class="space-y-4">
          <TobiCard v-for="i in 3" :key="i" class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div class="space-y-2 flex-1">
                <div class="h-4 w-32 bg-muted rounded animate-pulse" />
                <div class="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div class="h-16 bg-muted rounded animate-pulse" />
          </TobiCard>
        </div>

        <div
          v-else-if="reviews.length === 0"
          class="text-center py-8 text-muted">
          <TobiIcon
            name="i-lucide-message-circle"
            class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>

        <div v-else class="space-y-4">
          <ReviewCard
            v-for="review in reviews"
            :key="review.id"
            :review="review"
            :can-delete="review.userId === authStore.user?.id"
            :current-user-id="authStore.user?.id"
            @delete="handleDeleteReview"
            @like="handleLikeReview"
            @reply="handleReplyReview" />
        </div>

        <!-- Load More -->
        <div
          v-if="reviewMeta && reviewMeta.page < reviewMeta.totalPages"
          class="flex justify-center">
          <TobiButton variant="outline" @click="loadMoreReviews">
            Xem thêm đánh giá
          </TobiButton>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-16">
      <TobiIcon
        name="i-lucide-package-x"
        class="w-16 h-16 text-muted mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-foreground">
        Không tìm thấy sản phẩm
      </h3>
      <p class="text-muted mt-2">
        Sản phẩm không tồn tại hoặc bạn không có quyền truy cập
      </p>
      <TobiButton class="mt-4" @click="$router.push('/user/products')">
        Về trang sản phẩm
      </TobiButton>
    </div>

    <!-- Image Zoomer Modal -->
    <ImageZoomer
      v-model="showImageZoom"
      :image-src="product?.imageUrl || ''"
      :alt="product?.name || ''"
      :title="product?.name || 'Xem ảnh'"
      :watermark-text="authStore.user?.username || 'User'" />
  </div>
</template>

<script setup lang="ts">
import ImageZoomer from "~/components/organisms/ImageZoomer.vue";
import ReviewEditor from "~/components/organisms/ReviewEditor.vue";
import ReviewCard from "~/components/molecules/ReviewCard.vue";
import CanvasImage from "~/components/molecules/CanvasImage.vue";
import type { Review, PaginationMeta } from "~/types";

definePageMeta({
  layout: "user",
});

const route = useRoute();
const productStore = useProductStore();
const authStore = useAuthStore();
const toast = useToast();
const {
  connect,
  joinProductRoom,
  leaveProductRoom,
  onNewReview,
  onReviewUpdated,
  onReviewDeleted,
  onProductReactionUpdated,
  onProductSavedUpdated,
} = useSocket();

const product = computed(() => productStore.currentProduct);
const showImageZoom = ref(false);

// Reaction & Save state
const reactionState = ref({ count: 0, reacted: false });
const isSaved = ref(false);

// Review state
const reviewContent = ref("");
const reviews = ref<Review[]>([]);
const reviewMeta = ref<PaginationMeta | null>(null);
const loadingReviews = ref(false);
const submittingReview = ref(false);

// WebSocket cleanup functions
let unsubNewReview: (() => void) | undefined;
let unsubReviewUpdated: (() => void) | undefined;
let unsubReviewDeleted: (() => void) | undefined;
let unsubReactionUpdated: (() => void) | undefined;
let unsubSavedUpdated: (() => void) | undefined;

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
  try {
    await productStore.fetchProduct(id);
    await Promise.all([
      fetchReviews(),
      fetchReactionState(),
      fetchSavedState(),
      trackProductView(id),
    ]);

    // Connect to WebSocket and join product room
    connect();
    joinProductRoom(id);

    // Set up WebSocket listeners
    unsubNewReview = onNewReview((newReview: Review) => {
      // Check if the review already exists to avoid duplicates
      const exists = reviews.value.some((r) => r.id === newReview.id);
      if (!exists && !newReview.parentId) {
        reviews.value.unshift(newReview);
      } else if (newReview.parentId) {
        // Add reply to parent review
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
      // Update the review in the tree (handles both parent reviews and replies)
      updateReviewInTree(reviews.value, updatedReview.id, (review) => {
        Object.assign(review, updatedReview);
      });
    });

    unsubReviewDeleted = onReviewDeleted(
      ({ reviewId }: { reviewId: string }) => {
        reviews.value = deleteReviewFromTree(reviews.value, reviewId);
      }
    );

    unsubReactionUpdated = onProductReactionUpdated(
      (data: { count: number; userId: string; reacted: boolean }) => {
        reactionState.value.count = data.count;
        // Only update reacted state if it's for the current user
        if (data.userId === authStore.user?.id) {
          reactionState.value.reacted = data.reacted;
        }
      }
    );

    unsubSavedUpdated = onProductSavedUpdated(
      (data: { userId: string; saved: boolean }) => {
        // Only update saved state if it's for the current user
        if (data.userId === authStore.user?.id) {
          isSaved.value = data.saved;
        }
      }
    );
  } catch (error) {
    console.error("Failed to fetch product:", error);
  }
});

onUnmounted(() => {
  const id = route.params.id as string;
  leaveProductRoom(id);

  // Clean up WebSocket listeners
  unsubNewReview?.();
  unsubReviewUpdated?.();
  unsubReviewDeleted?.();
  unsubReactionUpdated?.();
  unsubSavedUpdated?.();
});

// Get or create session ID for tracking views
const getSessionId = (): string => {
  if (import.meta.client) {
    let sessionId = sessionStorage.getItem("viewSessionId");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("viewSessionId", sessionId);
    }
    return sessionId;
  }
  return "";
};

const trackProductView = async (productId: string) => {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;

    await $fetch(`${useRuntimeConfig().public.apiBaseUrl}/statistics/view`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: {
        productId,
        sessionId,
      },
    });
  } catch (error) {
    // Silently fail - tracking is not critical
    console.debug("Failed to track view:", error);
  }
};

const fetchReactionState = async () => {
  const productId = route.params.id as string;
  try {
    const response = await $fetch<{ count: number; reacted: boolean }>(
      `${useRuntimeConfig().public.apiBaseUrl}/products/${productId}/reaction`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    reactionState.value = response;
  } catch (error) {
    console.error("Failed to fetch reaction state:", error);
  }
};

const fetchSavedState = async () => {
  const productId = route.params.id as string;
  try {
    const response = await $fetch<{ saved: boolean }>(
      `${useRuntimeConfig().public.apiBaseUrl}/products/${productId}/save`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    isSaved.value = response.saved;
  } catch (error) {
    console.error("Failed to fetch saved state:", error);
  }
};

const toggleReaction = async () => {
  const productId = route.params.id as string;
  try {
    const response = await $fetch<{ reacted: boolean; count: number }>(
      `${useRuntimeConfig().public.apiBaseUrl}/products/${productId}/reaction`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    reactionState.value = response;
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể thực hiện thao tác",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};

const toggleSaved = async () => {
  const productId = route.params.id as string;
  try {
    const response = await $fetch<{ saved: boolean }>(
      `${useRuntimeConfig().public.apiBaseUrl}/products/${productId}/save`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    isSaved.value = response.saved;
    toast.add({
      title: "Thành công",
      description: response.saved ? "Đã lưu sản phẩm" : "Đã bỏ lưu sản phẩm",
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

const handleImageError = async (event: Event) => {
  const img = event.target as HTMLImageElement;
  const productId = route.params.id as string;

  try {
    // Fetch new signed URL
    const response = await $fetch<{ url: string }>(
      `${
        useRuntimeConfig().public.apiBaseUrl
      }/products/${productId}/refresh-image`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.url) {
      img.src = response.url;
    }
  } catch (error) {
    console.error("Failed to refresh image URL:", error);
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
        query: { page, limit: 10 },
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

const submitReview = async () => {
  if (!reviewContent.value.trim()) return;

  const productId = route.params.id as string;
  submittingReview.value = true;

  try {
    await $fetch<Review>(`${useRuntimeConfig().public.apiBaseUrl}/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: {
        productId,
        content: reviewContent.value,
      },
    });
    // Don't add locally - socket will handle it
    reviewContent.value = "";
    toast.add({
      title: "Thành công",
      description: "Đánh giá đã được gửi",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể gửi đánh giá. Vui lòng thử lại",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    submittingReview.value = false;
  }
};

const handleDeleteReview = async (reviewId: string) => {
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
    // Use deleteReviewFromTree to handle both parent reviews and replies
    reviews.value = deleteReviewFromTree(reviews.value, reviewId);
    toast.add({
      title: "Thành công",
      description: "Đánh giá đã được xóa",
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

const handleLikeReview = async (reviewId: string, isLike: boolean) => {
  try {
    const response = await $fetch<Review>(
      `${useRuntimeConfig().public.apiBaseUrl}/reviews/${reviewId}/like`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: { isLike },
      }
    );
    // Update the review in the list
    const index = reviews.value.findIndex((r) => r.id === reviewId);
    if (index !== -1) {
      reviews.value[index] = { ...reviews.value[index], ...response };
    }
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể thực hiện thao tác",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};

const handleReplyReview = async (parentId: string, content: string) => {
  const productId = route.params.id as string;
  try {
    await $fetch<Review>(`${useRuntimeConfig().public.apiBaseUrl}/reviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: {
        productId,
        content,
        parentId,
      },
    });
    // Don't add locally - socket will handle it
    toast.add({
      title: "Thành công",
      description: "Đã gửi phản hồi",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể gửi phản hồi",
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
