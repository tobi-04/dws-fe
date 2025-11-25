<template>
  <TobiCard :class="{ 'opacity-60': review.isHidden }">
    <div class="flex gap-4">
      <!-- Avatar -->
      <div class="shrink-0">
        <div
          class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span class="text-primary font-semibold text-sm">
            {{ review.username?.charAt(0).toUpperCase() || "U" }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-foreground">
              {{ review.username }}
            </span>
            <span class="text-muted text-sm">
              {{ formatDate(review.createdAt) }}
            </span>
            <TobiBadge v-if="review.isHidden" color="warning" size="xs">
              Đã ẩn
            </TobiBadge>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1">
            <!-- Admin Actions -->
            <template v-if="isAdmin">
              <TobiButton
                v-if="review.isHidden"
                variant="ghost"
                size="xs"
                color="success"
                @click="$emit('show', review.id)">
                <TobiIcon name="i-lucide-eye" class="w-4 h-4" />
              </TobiButton>
              <TobiButton
                v-else
                variant="ghost"
                size="xs"
                color="warning"
                @click="$emit('hide', review.id)">
                <TobiIcon name="i-lucide-eye-off" class="w-4 h-4" />
              </TobiButton>
              <TobiButton
                variant="ghost"
                size="xs"
                color="error"
                @click="$emit('deleteAsAdmin', review.id)">
                <TobiIcon name="i-lucide-trash-2" class="w-4 h-4" />
              </TobiButton>
            </template>
            <!-- User Delete -->
            <TobiButton
              v-else-if="canDelete"
              variant="ghost"
              size="xs"
              color="error"
              @click="$emit('delete', review.id)">
              <TobiIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </TobiButton>
          </div>
        </div>

        <!-- Review Content -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          class="mt-2 prose prose-sm max-w-none text-foreground"
          v-html="sanitizedContent" />

        <!-- Actions: Like, Dislike, Reply -->
        <div class="mt-3 flex items-center gap-4">
          <!-- Like -->
          <button
            class="flex items-center gap-1 text-sm transition-colors cursor-pointer"
            :class="
              review.userReaction === true
                ? 'text-primary'
                : 'text-muted hover:text-foreground'
            "
            @click="$emit('like', review.id, true)">
            <TobiIcon
              :name="
                review.userReaction === true
                  ? 'i-lucide-thumbs-up'
                  : 'i-lucide-thumbs-up'
              "
              class="w-4 h-4 cursor-pointer" />
            <span>{{ review.likes || 0 }}</span>
          </button>

          <!-- Dislike -->
          <button
            class="flex items-center gap-1 text-sm transition-colors cursor-pointer"
            :class="
              review.userReaction === false
                ? 'text-error'
                : 'text-muted hover:text-foreground'
            "
            @click="$emit('like', review.id, false)">
            <TobiIcon
              name="i-lucide-thumbs-down"
              class="w-4 h-4 cursor-pointer" />
            <span>{{ review.dislikes || 0 }}</span>
          </button>

          <!-- Reply Button -->
          <button
            v-if="!isReply"
            class="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
            @click="showReplyEditor = !showReplyEditor">
            <TobiIcon
              name="i-lucide-message-circle"
              class="w-4 h-4 cursor-pointer" />
            <span>Trả lời</span>
          </button>
        </div>

        <!-- Reply Editor -->
        <div v-if="showReplyEditor" class="mt-3">
          <ReviewEditor
            v-model="replyContent"
            placeholder="Viết trả lời..."
            :loading="submittingReply" />
          <div class="mt-2 flex justify-end gap-2">
            <TobiButton
              variant="outline"
              size="sm"
              @click="showReplyEditor = false">
              Hủy
            </TobiButton>
            <TobiButton
              size="sm"
              :loading="submittingReply"
              :disabled="!replyContent.trim()"
              @click="submitReply">
              Gửi
            </TobiButton>
          </div>
        </div>

        <!-- Replies -->
        <div
          v-if="review.replies && review.replies.length > 0"
          class="mt-4 space-y-3 pl-4 border-l-2 border-muted">
          <ReviewCard
            v-for="reply in review.replies"
            :key="reply.id"
            :review="reply"
            :can-delete="reply.userId === currentUserId"
            :is-reply="true"
            :current-user-id="currentUserId"
            @delete="(id: string) => $emit('delete', id)"
            @like="(id: string, isLike: boolean) => $emit('like', id, isLike)" />
        </div>
      </div>
    </div>
  </TobiCard>
</template>

<script setup lang="ts">
import type { Review } from "~/types";
import ReviewEditor from "~/components/organisms/ReviewEditor.vue";

interface Props {
  review: Review;
  canDelete?: boolean;
  isReply?: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canDelete: false,
  isReply: false,
  currentUserId: "",
  isAdmin: false,
});

const emit = defineEmits<{
  delete: [id: string];
  like: [id: string, isLike: boolean];
  reply: [parentId: string, content: string];
  hide: [id: string];
  show: [id: string];
  deleteAsAdmin: [id: string];
}>();

const showReplyEditor = ref(false);
const replyContent = ref("");
const submittingReply = ref(false);

const submitReply = async () => {
  if (!replyContent.value.trim()) return;
  submittingReply.value = true;
  try {
    emit("reply", props.review.id, replyContent.value);
    replyContent.value = "";
    showReplyEditor.value = false;
  } finally {
    submittingReply.value = false;
  }
};

// Simple HTML sanitizer to prevent XSS
const sanitizedContent = computed(() => {
  const allowedTags = [
    "p",
    "strong",
    "em",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "blockquote",
    "br",
    "hr",
  ];
  const content = props.review.content || "";

  if (typeof document !== "undefined") {
    const temp = document.createElement("div");
    temp.innerHTML = content;

    const allElements = temp.querySelectorAll("*");
    allElements.forEach((el) => {
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        el.replaceWith(...el.childNodes);
      } else {
        const attrs = Array.from(el.attributes);
        attrs.forEach((attr) => {
          el.removeAttribute(attr.name);
        });
      }
    });

    return temp.innerHTML;
  }

  return content;
});

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return "Vừa xong";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;

  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>
