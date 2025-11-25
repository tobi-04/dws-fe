<template>
  <TobiModal
    :open="isOpen"
    @update:open="(value) => emit('update:modelValue', value)"
    title="Import sản phẩm từ Excel"
    :ui="{ width: 'max-w-4xl' }">
    <template #body>
      <div class="space-y-6">
        <!-- File Upload Section -->
        <div
          v-if="!uploadedFile && importStatus?.status !== 'processing'"
          class="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:bg-muted/50 transition-colors"
          @dragover.prevent
          @drop.prevent="handleDrop">
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept=".xlsx, .xls"
            @change="handleFileChange" />

          <div class="flex flex-col items-center gap-4">
            <div class="p-4 bg-primary-50 rounded-full">
              <TobiIcon
                name="i-lucide-upload-cloud"
                class="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 class="text-lg font-semibold">Tải lên file Excel</h3>
              <p class="text-sm text-muted mt-1">
                Kéo thả file vào đây hoặc click để chọn file
              </p>
              <p class="text-xs text-warning mt-2">
                ⚡ Tối ưu: Upload file trực tiếp, xử lý nhanh hơn 10x
              </p>
            </div>
            <div class="flex gap-3">
              <TobiButton variant="outline" @click="triggerFileInput">
                Chọn file
              </TobiButton>
              <TobiButton variant="ghost" @click="downloadSample">
                <TobiIcon name="i-lucide-download" class="w-4 h-4 mr-2" />
                Tải file mẫu
              </TobiButton>
            </div>
          </div>
        </div>

        <!-- File Selected -->
        <div
          v-else-if="uploadedFile && !importStatus"
          class="border border-muted rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-success/10 rounded">
                <TobiIcon
                  name="i-lucide-file-spreadsheet"
                  class="w-6 h-6 text-success" />
              </div>
              <div>
                <p class="font-medium">{{ uploadedFile.name }}</p>
                <p class="text-sm text-muted">
                  {{ formatFileSize(uploadedFile.size) }}
                </p>
              </div>
            </div>
            <TobiButton variant="ghost" size="sm" @click="reset">
              <TobiIcon name="i-lucide-x" class="w-4 h-4" />
            </TobiButton>
          </div>
        </div>

        <!-- Processing Status -->
        <div v-if="importStatus" class="space-y-4">
          <div class="border border-muted rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div
                  class="p-2 rounded"
                  :class="{
                    'bg-blue-50': importStatus.status === 'pending',
                    'bg-primary-50 animate-pulse':
                      importStatus.status === 'processing',
                    'bg-success/10': importStatus.status === 'completed',
                    'bg-error/10': importStatus.status === 'failed',
                  }">
                  <TobiIcon
                    :name="getStatusIcon(importStatus.status)"
                    class="w-6 h-6"
                    :class="{
                      'text-blue-500': importStatus.status === 'pending',
                      'text-primary': importStatus.status === 'processing',
                      'text-success': importStatus.status === 'completed',
                      'text-error': importStatus.status === 'failed',
                      'animate-spin': importStatus.status === 'processing',
                    }" />
                </div>
                <div>
                  <p class="font-semibold">
                    {{ getStatusText(importStatus.status) }}
                  </p>
                  <p class="text-sm text-muted">
                    Job ID: {{ importStatus.jobId.substring(0, 8) }}...
                  </p>
                </div>
              </div>
              <TobiBadge :color="getStatusColor(importStatus.status)">
                {{ importStatus.status.toUpperCase() }}
              </TobiBadge>
            </div>

            <!-- Progress Bar -->
            <div v-if="importStatus.status !== 'failed'" class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>Tiến trình</span>
                <span class="font-medium"
                  >{{ importStatus.processed }} / {{ importStatus.total }}</span
                >
              </div>
              <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  class="h-full transition-all duration-300 rounded-full"
                  :class="{
                    'bg-primary': importStatus.status === 'processing',
                    'bg-success': importStatus.status === 'completed',
                  }"
                  :style="{
                    width: `${
                      (importStatus.processed / importStatus.total) * 100
                    }%`,
                  }"></div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div class="text-center p-3 bg-muted/50 rounded-lg">
                <p class="text-2xl font-bold text-success">
                  {{ importStatus.successful }}
                </p>
                <p class="text-xs text-muted">Thành công</p>
              </div>
              <div class="text-center p-3 bg-muted/50 rounded-lg">
                <p class="text-2xl font-bold text-error">
                  {{ importStatus.failed }}
                </p>
                <p class="text-xs text-muted">Thất bại</p>
              </div>
              <div class="text-center p-3 bg-muted/50 rounded-lg">
                <p class="text-2xl font-bold">{{ importStatus.total }}</p>
                <p class="text-xs text-muted">Tổng cộng</p>
              </div>
            </div>

            <!-- Error Message -->
            <TobiAlert
              v-if="importStatus.error"
              color="error"
              :title="importStatus.error"
              class="mt-4" />
          </div>

          <!-- Completion Message -->
          <div
            v-if="importStatus.status === 'completed'"
            class="bg-success/10 text-success p-4 rounded-lg flex items-center gap-3">
            <TobiIcon name="i-lucide-check-circle" class="w-5 h-5" />
            <div>
              <p class="font-semibold">Import hoàn tất!</p>
              <p class="text-sm">
                Đã tạo thành công {{ importStatus.successful }} sản phẩm
              </p>
            </div>
          </div>
        </div>

        <TobiAlert v-if="error" color="error" :title="error" />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <TobiButton
          v-if="!importStatus || importStatus.status === 'completed'"
          variant="outline"
          @click="close">
          {{ importStatus?.status === "completed" ? "Đóng" : "Hủy" }}
        </TobiButton>
        <TobiButton
          v-if="uploadedFile && !importStatus"
          :loading="loading"
          @click="handleImport">
          Bắt đầu Import
        </TobiButton>
      </div>
    </template>
  </TobiModal>
</template>

<script setup lang="ts">
import { writeFile, utils } from "xlsx";
import type { ImportJobStatus } from "~/types";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const productStore = useProductStore();
const toast = useToast();

const isOpen = computed(() => props.modelValue);
const fileInput = ref<HTMLInputElement>();
const loading = ref(false);
const error = ref("");
const uploadedFile = ref<File | null>(null);
const importStatus = ref<ImportJobStatus | null>(null);
let pollInterval: NodeJS.Timeout | null = null;

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    uploadedFile.value = file;
    error.value = "";
  }
};

const handleDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0];
  if (file) {
    uploadedFile.value = file;
    error.value = "";
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const reset = () => {
  uploadedFile.value = null;
  importStatus.value = null;
  error.value = "";
  if (fileInput.value) fileInput.value.value = "";
  stopPolling();
};

const close = () => {
  emit("update:modelValue", false);
  setTimeout(() => {
    reset();
  }, 300);
};

const downloadSample = () => {
  const ws = utils.json_to_sheet([
    {
      "Tên sản phẩm": "Sản phẩm mẫu 1",
      "Hình ảnh": "https://example.com/image1.jpg",
      "Trạng thái": "PUBLISHED",
      Whitelist: "",
    },
    {
      "Tên sản phẩm": "Sản phẩm mẫu 2",
      "Hình ảnh": "https://example.com/image2.jpg",
      "Trạng thái": "PRIVATE",
      Whitelist: "",
    },
    {
      "Tên sản phẩm": "Sản phẩm mẫu 3 (Whitelist)",
      "Hình ảnh": "https://example.com/image3.jpg",
      "Trạng thái": "WHITELIST",
      Whitelist: "user-id-1,user-id-2,user-id-3",
    },
  ]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Products");
  writeFile(wb, "sample-products.xlsx");
};

const handleImport = async () => {
  if (!uploadedFile.value) return;

  loading.value = true;
  error.value = "";

  try {
    // Upload file và nhận job status
    const status = await productStore.importExcel(uploadedFile.value);
    importStatus.value = status;

    toast.add({
      title: "Đã bắt đầu import",
      description: `Đang xử lý ${status.total} sản phẩm...`,
      color: "info",
      icon: "i-lucide-clock",
    });

    // Bắt đầu polling để kiểm tra tiến trình
    startPolling(status.jobId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Import thất bại";
    toast.add({
      title: "Import thất bại",
      description: error.value,
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    loading.value = false;
  }
};

const startPolling = (jobId: string) => {
  pollInterval = setInterval(async () => {
    try {
      const status = await productStore.getImportStatus(jobId);
      importStatus.value = status;

      if (status.status === "completed") {
        stopPolling();
        toast.add({
          title: "Import hoàn tất",
          description: `Đã tạo ${status.successful} sản phẩm thành công`,
          color: "success",
          icon: "i-lucide-check-circle",
        });
        emit("success");
      } else if (status.status === "failed") {
        stopPolling();
        toast.add({
          title: "Import thất bại",
          description: status.error || "Đã xảy ra lỗi",
          color: "error",
          icon: "i-lucide-alert-circle",
        });
      }
    } catch (err) {
      console.error("Polling error:", err);
      stopPolling();
    }
  }, 2000); // Poll every 2 seconds
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return "i-lucide-clock";
    case "processing":
      return "i-lucide-loader-2";
    case "completed":
      return "i-lucide-check-circle";
    case "failed":
      return "i-lucide-x-circle";
    default:
      return "i-lucide-help-circle";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Đang chờ xử lý";
    case "processing":
      return "Đang xử lý";
    case "completed":
      return "Hoàn tất";
    case "failed":
      return "Thất bại";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "info";
    case "processing":
      return "primary";
    case "completed":
      return "success";
    case "failed":
      return "error";
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

// Cleanup on unmount
onUnmounted(() => {
  stopPolling();
});
</script>
