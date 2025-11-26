<template>
  <TobiModal
    v-model:open="modelValue"
    :title="title"
    :ui="{
      content: 'max-w-5xl w-full',
    }">
    <template #body>
      <div class="relative select-none" @contextmenu.prevent @dragstart.prevent>
        <!-- User Info Badge -->
        <div
          class="absolute top-4 left-4 z-30 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg">
          <TobiIcon name="i-lucide-user" class="w-4 h-4" />
          <span class="text-sm font-medium">{{ watermarkText }}</span>
        </div>

        <!-- Instructions -->
        <div
          class="absolute top-4 right-4 z-30 text-xs text-foreground bg-muted/90 px-3 py-1.5 rounded-full shadow">
          Cuộn để zoom • Kéo để di chuyển • Double-click reset
        </div>

        <!-- Main Container -->
        <div
          ref="containerRef"
          class="relative w-full h-[75vh] overflow-hidden bg-muted rounded-lg cursor-grab active:cursor-grabbing"
          @wheel.prevent="handleWheel"
          @mousedown="handleMouseDown"
          @dblclick="reset">
          <!-- Image Container -->
          <div
            class="absolute inset-0 flex items-center justify-center"
            :style="{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }">
            <canvas
              ref="canvasRef"
              class="max-w-full max-h-full object-contain pointer-events-none select-none"
              draggable="false" />
          </div>

          <!-- Watermark Layer - 4 diagonal rows -->
          <div
            class="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div class="watermark-container">
              <div v-for="row in 4" :key="row" class="watermark-row">
                <span
                  v-for="i in 20"
                  :key="`${row}-${i}`"
                  class="watermark-text">
                  {{ watermarkText }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Zoom Controls -->
        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 bg-muted/95 rounded-full px-4 py-2 shadow-lg border border-muted">
          <TobiButton
            variant="ghost"
            size="sm"
            :disabled="scale <= 0.5"
            @click="zoomOut">
            <TobiIcon name="i-lucide-zoom-out" class="w-5 h-5" />
          </TobiButton>

          <div class="flex items-center gap-1 min-w-20 justify-center">
            <input
              v-model.number="scaleInput"
              type="range"
              min="50"
              max="500"
              step="10"
              class="w-16 h-1 accent-primary cursor-pointer"
              @input="handleSliderChange" />
            <span
              class="text-sm font-medium text-foreground min-w-12 text-right">
              {{ Math.round(scale * 100) }}%
            </span>
          </div>

          <TobiButton
            variant="ghost"
            size="sm"
            :disabled="scale >= 5"
            @click="zoomIn">
            <TobiIcon name="i-lucide-zoom-in" class="w-5 h-5" />
          </TobiButton>

          <div class="w-px h-6 bg-muted mx-1" />

          <TobiButton variant="ghost" size="sm" @click="reset">
            <TobiIcon name="i-lucide-maximize" class="w-5 h-5" />
          </TobiButton>
        </div>
      </div>
    </template>
  </TobiModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  imageSrc: string;
  alt?: string;
  title?: string;
  watermarkText: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "Image",
  title: "Xem ảnh",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const imageLoaded = ref(false);

// Zoom and pan state
const scale = ref(1);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const initialPosition = ref({ x: 0, y: 0 });

const scaleInput = computed({
  get: () => Math.round(scale.value * 100),
  set: (val) => {
    scale.value = val / 100;
  },
});

const handleSliderChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  scale.value = Number(target.value) / 100;
};

// Draw image on canvas
const drawImageOnCanvas = async () => {
  if (!props.imageSrc || !canvasRef.value) return;

  try {
    const img = new Image();
    // For base64 images, no need for crossOrigin
    if (!props.imageSrc.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = props.imageSrc;
    });

    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to image size
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0);
    imageLoaded.value = true;
  } catch (e) {
    console.error("Failed to draw image on canvas:", e);
  }
};

const centerImage = () => {
  position.value = { x: 0, y: 0 };
  scale.value = 1;
};

// Mouse wheel zoom
const handleWheel = (e: WheelEvent) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  const newScale = Math.max(0.5, Math.min(5, scale.value + delta));
  scale.value = newScale;
};

// Zoom controls
const zoomIn = () => {
  scale.value = Math.min(5, scale.value + 0.25);
};

const zoomOut = () => {
  scale.value = Math.max(0.5, scale.value - 0.25);
};

const reset = () => {
  scale.value = 1;
  position.value = { x: 0, y: 0 };
};

// Drag handlers
const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;
  isDragging.value = true;
  dragStart.value = { x: e.clientX, y: e.clientY };
  initialPosition.value = { ...position.value };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;

  const dx = e.clientX - dragStart.value.x;
  const dy = e.clientY - dragStart.value.y;

  position.value = {
    x: initialPosition.value.x + dx,
    y: initialPosition.value.y + dy,
  };
};

const handleMouseUp = () => {
  isDragging.value = false;
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
};

// Touch support
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  isDragging.value = true;
  dragStart.value = { x: touch.clientX, y: touch.clientY };
  initialPosition.value = { ...position.value };

  window.addEventListener("touchmove", handleTouchMove);
  window.addEventListener("touchend", handleTouchEnd);
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  const touch = e.touches[0];
  if (!touch) return;

  const dx = touch.clientX - dragStart.value.x;
  const dy = touch.clientY - dragStart.value.y;

  position.value = {
    x: initialPosition.value.x + dx,
    y: initialPosition.value.y + dy,
  };
};

const handleTouchEnd = () => {
  isDragging.value = false;
  window.removeEventListener("touchmove", handleTouchMove);
  window.removeEventListener("touchend", handleTouchEnd);
};

// Add touch events on mount
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener("touchstart", handleTouchStart);
  }

  // Disable keyboard shortcuts for saving/dev tools when modal is open
  const handleKeydown = (e: KeyboardEvent) => {
    if (props.modelValue) {
      if (
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U") ||
        e.key === "F12" ||
        (e.ctrlKey && e.key === "s")
      ) {
        e.preventDefault();
      }
    }
  };

  window.addEventListener("keydown", handleKeydown);

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    if (containerRef.value) {
      containerRef.value.removeEventListener("touchstart", handleTouchStart);
    }
  });
});

// Reset when modal opens and draw image
watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      reset();
      await nextTick();
      await drawImageOnCanvas();
    }
  }
);

// Also watch for imageSrc changes
watch(
  () => props.imageSrc,
  async () => {
    if (props.modelValue) {
      await nextTick();
      await drawImageOnCanvas();
    }
  }
);
</script>

<style scoped>
.watermark-container {
  position: absolute;
  inset: -50%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  transform: rotate(-25deg);
  opacity: 0.15;
}

.watermark-row {
  display: flex;
  gap: 60px;
  white-space: nowrap;
  animation: scroll 20s linear infinite;
}

.watermark-row:nth-child(2) {
  animation-delay: -5s;
}

.watermark-row:nth-child(3) {
  animation-delay: -10s;
}

.watermark-row:nth-child(4) {
  animation-delay: -15s;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.watermark-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-foreground);
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
  letter-spacing: 0.08em;
  padding: 20px 0;
}

/* Range slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-muted);
  border-radius: 9999px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
