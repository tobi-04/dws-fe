<script setup lang="ts">
export type ConfirmDialogProps = {
  title?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void | Promise<void>;
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral";
};

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  title: "Xác nhận hành động",
  description:
    "Bạn có chắc chắn muốn thực hiện hành động này? Hành động này không thể hoàn tác.",
  cancelLabel: "Hủy",
  confirmLabel: "Xác nhận",
  color: "primary",
});

const emit = defineEmits<{ close: [boolean] }>();

// state
const isLoading = ref(false);

// methods
function onHandleCancel() {
  props.onCancel?.();
  emit("close", true);
}

async function onHandleConfirm() {
  try {
    isLoading.value = true;

    const result = props.onConfirm?.();
    if (result instanceof Promise) {
      await result;
    }
  } finally {
    emit("close", true);
    isLoading.value = false;
  }
}
</script>

<template>
  <TobiModal
    :close="{ onClick: () => emit('close', false) }"
    :title="title"
    :ui="{
      content: '!max-w-[400px]',
      footer: 'justify-end gap-4',
    }">
    <template #body>
      <div
        class="text-sm text-gray-500 dark:text-gray-400"
        v-html="description" />
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <TobiButton
          color="neutral"
          variant="ghost"
          :disabled="isLoading"
          :label="cancelLabel"
          @click="onHandleCancel" />
        <TobiButton
          :color="color"
          :loading="isLoading"
          :label="confirmLabel"
          @click="onHandleConfirm" />
      </div>
    </template>
  </TobiModal>
</template>
