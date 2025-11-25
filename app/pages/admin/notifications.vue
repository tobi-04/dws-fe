<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">Gửi thông báo</h2>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Form gửi thông báo -->
      <div class="bg-background rounded-lg p-6 border border-muted">
        <h3 class="text-lg font-semibold mb-4">Soạn thông báo</h3>

        <div class="space-y-4">
          <!-- Search user -->
          <div>
            <label class="block text-sm font-medium mb-2">Người nhận</label>
            <div class="relative">
              <TobiInput
                v-model="searchQuery"
                placeholder="Tìm kiếm theo username..."
                class="w-full"
                @input="handleSearch" />
              <!-- Dropdown kết quả tìm kiếm -->
              <div
                v-if="showDropdown && searchResults.length > 0"
                class="absolute z-50 w-full mt-1 border bg-muted border-muted rounded-lg shadow-lg max-h-60 overflow-auto">
                <button
                  v-for="user in searchResults"
                  :key="user.id"
                  type="button"
                  class="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center justify-between"
                  @click="selectUser(user)">
                  <span>{{ user.username }}</span>
                  <TobiBadge
                    :color="user.status === 'BANNED' ? 'warning' : 'success'"
                    size="xs">
                    {{ user.status === "BANNED" ? "Đã khóa" : "Hoạt động" }}
                  </TobiBadge>
                </button>
              </div>
              <div
                v-else-if="showDropdown && searchQuery && !searching"
                class="absolute z-50 w-full mt-1 bg-background border border-muted rounded-lg shadow-lg p-4 text-center text-muted">
                Không tìm thấy người dùng
              </div>
            </div>
            <!-- Selected user display -->
            <div
              v-if="selectedUser"
              class="mt-2 flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-muted">
              <TobiIcon name="i-lucide-user" class="w-4 h-4" />
              <span class="font-medium">{{ selectedUser.username }}</span>
              <TobiButton
                variant="ghost"
                size="xs"
                class="ml-auto"
                @click="clearSelectedUser">
                <TobiIcon name="i-lucide-x" class="w-4 h-4" />
              </TobiButton>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium mb-2">Tiêu đề</label>
            <TobiInput
              v-model="title"
              placeholder="Nhập tiêu đề thông báo"
              class="w-full" />
          </div>

          <!-- Content with TipTap -->
          <div>
            <label class="block text-sm font-medium mb-2">Nội dung</label>
            <div class="border border-muted rounded-lg">
              <!-- Toolbar -->
              <div
                class="flex flex-wrap gap-1 p-2 border border-muted border-b">
                <TobiButton
                  variant="ghost"
                  size="xs"
                  :class="{ 'bg-muted': editor?.isActive('bold') }"
                  @click="editor?.chain().focus().toggleBold().run()">
                  <TobiIcon name="i-lucide-bold" class="w-4 h-4" />
                </TobiButton>
                <TobiButton
                  variant="ghost"
                  size="xs"
                  :class="{ 'bg-muted': editor?.isActive('italic') }"
                  @click="editor?.chain().focus().toggleItalic().run()">
                  <TobiIcon name="i-lucide-italic" class="w-4 h-4" />
                </TobiButton>
                <TobiButton
                  variant="ghost"
                  size="xs"
                  :class="{ 'bg-muted': editor?.isActive('strike') }"
                  @click="editor?.chain().focus().toggleStrike().run()">
                  <TobiIcon name="i-lucide-strikethrough" class="w-4 h-4" />
                </TobiButton>
                <div class="w-px h-6 bg-muted mx-1" />
                <TobiButton
                  variant="ghost"
                  size="xs"
                  :class="{ 'bg-muted': editor?.isActive('bulletList') }"
                  @click="editor?.chain().focus().toggleBulletList().run()">
                  <TobiIcon name="i-lucide-list" class="w-4 h-4" />
                </TobiButton>
                <TobiButton
                  variant="ghost"
                  size="xs"
                  :class="{ 'bg-muted': editor?.isActive('orderedList') }"
                  @click="editor?.chain().focus().toggleOrderedList().run()">
                  <TobiIcon name="i-lucide-list-ordered" class="w-4 h-4" />
                </TobiButton>
                <div class="w-px h-6 bg-muted mx-1" />
                <TobiButton
                  variant="ghost"
                  size="xs"
                  @click="editor?.chain().focus().undo().run()">
                  <TobiIcon name="i-lucide-undo" class="w-4 h-4" />
                </TobiButton>
                <TobiButton
                  variant="ghost"
                  size="xs"
                  @click="editor?.chain().focus().redo().run()">
                  <TobiIcon name="i-lucide-redo" class="w-4 h-4" />
                </TobiButton>
              </div>
              <!-- Editor content -->
              <EditorContent :editor="editor" class="p-3 min-h-40 prose-sm" />
            </div>
          </div>

          <!-- Submit button -->
          <TobiButton
            :loading="sending"
            :disabled="!canSend"
            class="w-full"
            @click="sendNotification">
            <TobiIcon name="i-lucide-send" class="w-4 h-4 mr-2" />
            Gửi thông báo
          </TobiButton>
        </div>
      </div>

      <!-- Preview -->
      <div class="bg-background rounded-lg p-6 border border-muted">
        <h3 class="text-lg font-semibold mb-4">Xem trước</h3>

        <div
          v-if="title || editor?.getHTML()"
          class="border border-muted rounded-lg p-4">
          <div class="flex items-start gap-3">
            <div class="shrink-0">
              <TobiIcon name="i-lucide-mail" class="w-5 h-5 text-indigo-500" />
            </div>
            <div class="flex-1">
              <p class="font-medium line-clamp-1">
                {{ title || "Tiêu đề thông báo" }}
              </p>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div
                class="text-sm text-muted mt-1 prose-sm line-clamp-2"
                v-html="editor?.getHTML() || '<p>Nội dung thông báo</p>'" />
              <p class="text-xs text-muted mt-2">Vừa xong</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-muted py-8">
          <TobiIcon name="i-lucide-eye" class="w-12 h-12 mx-auto mb-2" />
          <p>Bắt đầu soạn thông báo để xem trước</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import type { User } from "~/types";

definePageMeta({
  layout: "admin",
});

const toast = useToast();

const title = ref("");
const sending = ref(false);

// User search
const searchQuery = ref("");
const searchResults = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const showDropdown = ref(false);
const searching = ref(false);

// TipTap editor
const editor = useEditor({
  content: "",
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: "outline-none min-h-32",
    },
  },
});

// Search users by username
const handleSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    showDropdown.value = false;
    return;
  }

  searching.value = true;
  try {
    searchResults.value = await api.searchUsers(searchQuery.value);
    showDropdown.value = true;
  } catch (error) {
    console.error("Failed to search users:", error);
  } finally {
    searching.value = false;
  }
}, 300);

const selectUser = (user: User) => {
  selectedUser.value = user;
  searchQuery.value = "";
  searchResults.value = [];
  showDropdown.value = false;
};

const clearSelectedUser = () => {
  selectedUser.value = null;
};

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const canSend = computed(() => {
  return (
    selectedUser.value && title.value.trim() && editor.value?.getText().trim()
  );
});

const sendNotification = async () => {
  if (!canSend.value || !selectedUser.value) return;

  sending.value = true;
  try {
    await api.sendNotification(
      selectedUser.value.id,
      title.value,
      editor.value?.getHTML() || ""
    );

    toast.add({
      title: "Thành công",
      description: "Đã gửi thông báo",
      color: "success",
    });

    // Reset form
    selectedUser.value = null;
    title.value = "";
    editor.value?.commands.setContent("");
  } catch {
    toast.add({
      title: "Lỗi",
      description: "Không thể gửi thông báo",
      color: "error",
    });
  } finally {
    sending.value = false;
  }
};
</script>

<style>
.ProseMirror {
  min-height: 8rem;
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
