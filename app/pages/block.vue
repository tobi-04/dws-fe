<template>
  <div
    class="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
    <div class="max-w-lg w-full text-center">
      <!-- Icon cảnh báo -->
      <div class="mb-8 animate-pulse">
        <div
          class="mx-auto w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500">
          <TobiIcon name="i-lucide-shield-off" class="w-16 h-16 text-red-500" />
        </div>
      </div>

      <!-- Tiêu đề -->
      <h1 class="text-4xl font-bold text-white mb-4 animate-bounce">
        🚫 Truy cập bị từ chối
      </h1>

      <!-- Thông báo -->
      <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8">
        <p class="text-red-400 text-lg font-medium mb-4">
          Developer Tools đã bị vô hiệu hóa!
        </p>
        <p class="text-gray-400">
          Vì lý do bảo mật, việc sử dụng công cụ Developer Tools (F12, Inspect
          Element, View Source) bị cấm trên trang web này.
        </p>
      </div>

      <!-- Hướng dẫn -->
      <div
        class="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-left mb-8">
        <h2 class="text-white font-semibold mb-3 flex items-center gap-2">
          <TobiIcon name="i-lucide-info" class="w-5 h-5 text-blue-400" />
          Để tiếp tục sử dụng:
        </h2>
        <ul class="text-gray-400 space-y-2 text-sm">
          <li class="flex items-start gap-2">
            <span class="text-green-400 mt-1">✓</span>
            <span>Đóng hoàn toàn cửa sổ này</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-400 mt-1">✓</span>
            <span>Mở một tab mới mà kiểm tra lại</span>
          </li>
        </ul>
      </div>

      <!-- Cảnh báo nhỏ -->
      <p class="text-gray-600 text-xs mt-8">
        ⚠️ Hành vi cố tình vi phạm có thể dẫn đến việc bị cấm truy cập vĩnh viễn
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const router = useRouter();
const isChecking = ref(false);

const goBack = async () => {
  isChecking.value = true;

  // Kiểm tra xem DevTools có còn mở không
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  if (widthThreshold || heightThreshold) {
    isChecking.value = false;
    alert("Vui lòng đóng Developer Tools trước khi tiếp tục!");
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  isChecking.value = false;
  router.push("/");
};
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
