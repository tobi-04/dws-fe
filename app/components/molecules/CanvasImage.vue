<template>
  <div
    ref="containerRef"
    class="canvas-image-container"
    :class="containerClass"
    @contextmenu.prevent>
    <canvas
      ref="canvasRef"
      class="w-full h-full object-cover"
      :class="canvasClass" />
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-muted/50">
      <TobiIcon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin text-muted" />
    </div>
    <!-- Error state -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-muted">
      <TobiIcon name="i-lucide-image-off" class="w-8 h-8 text-muted" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string;
  alt?: string;
  containerClass?: string;
  canvasClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "Image",
  containerClass: "",
  canvasClass: "",
});

const emit = defineEmits<{
  load: [];
  error: [];
  click: [];
}>();

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const loading = ref(true);
const error = ref(false);
const isMounted = ref(false);
const lastDrawnSrc = ref("");

const drawImage = async () => {
  if (!props.src || !canvasRef.value || !containerRef.value) return;

  // Prevent redrawing same image
  if (lastDrawnSrc.value === props.src && !loading.value) return;

  loading.value = true;
  error.value = false;

  try {
    const img = new Image();
    // For base64 images, no need for crossOrigin
    if (!props.src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = props.src;
    });

    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get container size for responsive canvas
    const container = containerRef.value;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) return;

    // Set canvas size to match container
    canvas.width = containerWidth * window.devicePixelRatio;
    canvas.height = containerHeight * window.devicePixelRatio;

    // Calculate aspect ratio to cover container
    const imgRatio = img.width / img.height;
    const containerRatio = containerWidth / containerHeight;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > containerRatio) {
      // Image is wider - fit height, crop width
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      // Image is taller - fit width, crop height
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    loading.value = false;
    lastDrawnSrc.value = props.src;
    emit("load");
  } catch (e) {
    console.error("Failed to draw image:", e);
    loading.value = false;
    error.value = true;
    emit("error");
  }
};

// Watch for src changes - only draw when src actually changes
watch(
  () => props.src,
  (newSrc, oldSrc) => {
    if (isMounted.value && newSrc && newSrc !== oldSrc) {
      lastDrawnSrc.value = ""; // Reset to force redraw
      drawImage();
    }
  }
);

// Draw on mount
onMounted(async () => {
  isMounted.value = true;
  await nextTick();
  if (props.src) {
    drawImage();
  }
});
</script>

<style scoped>
.canvas-image-container {
  position: relative;
  overflow: hidden;
}
</style>
