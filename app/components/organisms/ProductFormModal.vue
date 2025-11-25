<template>
  <TobiModal
    :open="isOpen"
    @update:open="(value) => emit('update:modelValue', value)"
    :title="mode === 'create' ? 'Tạo sản phẩm mới' : 'Sửa sản phẩm'">
    <slot name="btn" />
    <template #body>
      <TobiForm :state="formState" @submit="handleSubmit" class="space-y-4">
        <TobiFormField name="name" label="Tên sản phẩm" required>
          <TobiInput
            class="w-full"
            v-model="formState.name"
            placeholder="Nhập tên sản phẩm"
            required />
        </TobiFormField>

        <TobiFormField name="status" label="Trạng thái" required>
          <TobiSelect
            v-model="formState.status"
            class="w-full"
            :items="options" />
        </TobiFormField>

        <!-- Whitelist Users - only show when status is WHITELIST -->
        <TobiFormField
          v-if="formState.status === 'WHITELIST'"
          name="whitelistUserIds"
          label="Người dùng được phép xem">
          <div class="space-y-2">
            <TobiInput
              class="w-full"
              v-model="searchUsername"
              placeholder="Tìm kiếm người dùng..."
              @input="handleSearchUsers" />
            <div
              v-if="searchResults.length > 0"
              class="border border-muted rounded-lg p-2 max-h-40 overflow-y-auto">
              <button
                v-for="user in searchResults"
                :key="user.id"
                type="button"
                class="w-full text-left px-3 py-2 hover:bg-muted rounded"
                @click="addUserToWhitelist(user.id, user.username)">
                {{ user.username }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <TobiBadge
                v-for="userId in formState.whitelistUserIds"
                :key="userId"
                color="info"
                class="cursor-pointer"
                @click="removeUserFromWhitelist(userId)">
                {{ getUsernameById(userId) }}
                <TobiIcon name="i-lucide-x" class="w-3 h-3 ml-1" />
              </TobiBadge>
            </div>
          </div>
        </TobiFormField>

        <TobiFormField name="image" label="Hình ảnh">
          <div class="space-y-2">
            <TobiInput
              class="w-full"
              v-model="formState.imageUrl"
              placeholder="Hoặc nhập URL hình ảnh"
              :disabled="formState.file && formState.file.size > 0"
              @input="handleImageUrlChange" />
            <TobiSeparator label="Hoặc" size="xs" />
            <TobiFileUpload
              v-model="formState.file"
              label="Drop your image here"
              description="SVG, PNG, JPG or GIF (max. 5MB)"
              class="w-full min-h-48"
              @update:modelValue="handleFileChange"
              accept="image/*" />
          </div>
        </TobiFormField>

        <TobiAlert v-if="error" color="error" :title="error" />

        <div class="flex gap-3 justify-end">
          <TobiButton variant="outline" @click="close"> Hủy </TobiButton>
          <TobiButton type="submit" :loading="loading">
            {{ mode === "create" ? "Tạo" : "Cập nhật" }}
          </TobiButton>
        </div>
      </TobiForm>
    </template>
  </TobiModal>
</template>

<script setup lang="ts">
import type { Product, CreateProductDto } from "~/types";

interface Props {
  modelValue: boolean;
  mode: "create" | "edit";
  product?: Product | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const productStore = useProductStore();
const userStore = useUserStore();

const isOpen = computed(() => props.modelValue);

const formState = reactive<CreateProductDto & { whitelistUserIds: string[] }>({
  name: "",
  imageUrl: "",
  file: undefined,
  status: "PRIVATE",
  whitelistUserIds: [],
});

const searchUsername = ref("");
const searchResults = ref<Array<{ id: string; username: string }>>([]);
const whitelistUsernames = ref<Record<string, string>>({});
const loading = ref(false);
const error = ref("");
const fileInput = ref<HTMLInputElement>();

const options = [
  { value: "PUBLISHED", label: "Công khai" },
  { value: "PRIVATE", label: "Riêng tư" },
  { value: "WHITELIST", label: "Whitelist" },
];

const resetForm = () => {
  formState.name = "";
  formState.imageUrl = "";
  formState.file = undefined;
  formState.status = "PRIVATE";
  formState.whitelistUserIds = [];
  whitelistUsernames.value = {};
  searchUsername.value = "";
  searchResults.value = [];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Initialize form when product changes
watch(
  () => props.product,
  (product) => {
    if (product && props.mode === "edit") {
      formState.name = product.name;
      formState.status = product.status;
      formState.whitelistUserIds = [...product.whitelistUserIds];
      formState.imageUrl = product.imageUrl || ""; // Set to product's image URL
      formState.file = undefined;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Clear whitelist when status changes from WHITELIST
watch(
  () => formState.status,
  (newStatus, oldStatus) => {
    if (oldStatus === "WHITELIST" && newStatus !== "WHITELIST") {
      formState.whitelistUserIds = [];
    }
  }
);

const handleSearchUsers = useDebounceFn(async () => {
  if (searchUsername.value.length < 2) {
    searchResults.value = [];
    return;
  }

  try {
    const users = await userStore.searchUsers(searchUsername.value);
    searchResults.value = users.map((u) => ({
      id: u.id,
      username: u.username,
    }));
  } catch {
    searchResults.value = [];
  }
}, 300);

const addUserToWhitelist = (userId: string, username: string) => {
  if (!formState.whitelistUserIds.includes(userId)) {
    formState.whitelistUserIds.push(userId);
    whitelistUsernames.value[userId] = username;
  }
  searchUsername.value = "";
  searchResults.value = [];
};

const removeUserFromWhitelist = (userId: string) => {
  const index = formState.whitelistUserIds.indexOf(userId);
  if (index > -1) {
    formState.whitelistUserIds.splice(index, 1);
  }
};

const getUsernameById = (userId: string) => {
  return whitelistUsernames.value[userId] || userId;
};

const handleFileChange = (
  files: File[] | File | FileList | null | undefined
) => {
  if (!files) return;

  console.log(files);

  let file: File | null = null;

  if (Array.isArray(files)) {
    file = files[0] || null;
  } else if (files instanceof FileList) {
    file = files.item(0);
  } else {
    file = files as File;
  }

  if (file) {
    formState.file = file;
    formState.imageUrl = ""; // Clear URL when file is selected
  }
};

const handleImageUrlChange = () => {
  if (formState.imageUrl) {
    formState.file = undefined;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

const handleSubmit = async () => {
  error.value = "";
  loading.value = true;

  try {
    if (props.mode === "create") {
      const dto: CreateProductDto = {
        name: formState.name,
        status: formState.status,
      };
      console.log(formState.file);
      if (formState.file) {
        dto.file = formState.file;
      } else if (formState.imageUrl) {
        dto.imageUrl = formState.imageUrl;
      }

      if (formState.status === "WHITELIST") {
        dto.whitelistUserIds = formState.whitelistUserIds;
      }
      console.log(dto);

      await productStore.createProduct(dto);
    } else if (props.product) {
      // Ở chế độ edit, chỉ gửi các trường đã thay đổi
      const dto: any = {};

      // So sánh và chỉ thêm trường đã thay đổi
      if (formState.name !== props.product.name) {
        dto.name = formState.name;
      }

      if (formState.status !== props.product.status) {
        dto.status = formState.status;
      }

      // Nếu có file mới, gửi file (sẽ xóa ảnh cũ ở backend)
      if (formState.file) {
        dto.file = formState.file;
      }
      // Nếu imageUrl thay đổi
      else if (formState.imageUrl !== props.product.imageUrl) {
        dto.imageUrl = formState.imageUrl;
      }

      // So sánh whitelistUserIds
      const oldWhitelist = [...props.product.whitelistUserIds].sort();
      const newWhitelist = [...formState.whitelistUserIds].sort();
      if (JSON.stringify(oldWhitelist) !== JSON.stringify(newWhitelist)) {
        dto.whitelistUserIds = formState.whitelistUserIds;
      }

      // Chỉ gửi request nếu có trường nào đó thay đổi
      if (Object.keys(dto).length > 0) {
        await productStore.updateProduct(props.product.id, dto);
      }
    }

    const toast = useToast();
    toast.add({
      title: props.mode === "create" ? "Tạo thành công" : "Cập nhật thành công",
      description:
        props.mode === "create"
          ? "Sản phẩm mới đã được tạo"
          : "Thông tin sản phẩm đã được cập nhật",
      color: "success",
      icon: "i-lucide-check-circle",
    });

    emit("success");
    close();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Thao tác thất bại";
  } finally {
    loading.value = false;
  }
};

const close = () => {
  emit("update:modelValue", false);
  resetForm();
};
</script>
