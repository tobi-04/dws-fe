import { ref, watch } from "vue";

export function useDebounce<T>(value: T, delay = 300) {
  const debounced = ref(value) as any;
  let timeout: ReturnType<typeof setTimeout>;

  watch(
    () => value,
    (newVal) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        debounced.value = newVal;
      }, delay);
    }
  );

  return debounced;
}

export function useDebounceFn(fn: (...args: any[]) => void, delay = 300) {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
