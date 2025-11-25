import type { ConfirmDialogProps } from "~/components/core/TobiConfirmDialog.vue";

export type { ConfirmDialogProps };

export default function useConfirmDialog() {
  const isOpen = ref(false);
  const config = ref<ConfirmDialogProps>({});
  const resolvePromise = ref<((value: boolean) => void) | null>(null);

  function close(result: boolean = false) {
    isOpen.value = false;
    if (resolvePromise.value) {
      resolvePromise.value(result);
      resolvePromise.value = null;
    }
  }

  function open(options: ConfirmDialogProps): Promise<boolean> {
    config.value = options;
    isOpen.value = true;

    return new Promise<boolean>((resolve) => {
      resolvePromise.value = resolve;
    });
  }

  function patch(options: Partial<ConfirmDialogProps>) {
    config.value = { ...config.value, ...options };
  }

  return {
    isOpen: readonly(isOpen),
    config: readonly(config),
    close,
    open,
    patch,
  };
}
