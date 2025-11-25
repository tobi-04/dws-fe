<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Thống kê</h1>
        <p class="text-muted mt-1">Dashboard thống kê sản phẩm</p>
      </div>

      <!-- Refresh Button -->
      <div class="flex items-center gap-4">
        <TobiButton @click="refreshStats">
          <TobiIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-2" />
          Làm mới
        </TobiButton>
      </div>
    </div>

    <!-- Statistics Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <TobiCard class="p-4">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-primary/10">
            <TobiIcon name="i-lucide-eye" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <p class="text-sm text-muted">Tổng lượt xem</p>
            <p class="text-2xl font-bold text-foreground">{{ totalViews }}</p>
          </div>
        </div>
      </TobiCard>

      <TobiCard class="p-4">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-error/10">
            <TobiIcon name="i-lucide-heart" class="w-6 h-6 text-error" />
          </div>
          <div>
            <p class="text-sm text-muted">Tổng lượt thích</p>
            <p class="text-2xl font-bold text-foreground">
              {{ totalReactions }}
            </p>
          </div>
        </div>
      </TobiCard>

      <TobiCard class="p-4">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-warning/10">
            <TobiIcon name="i-lucide-bookmark" class="w-6 h-6 text-warning" />
          </div>
          <div>
            <p class="text-sm text-muted">Tổng lượt lưu</p>
            <p class="text-2xl font-bold text-foreground">{{ totalSaves }}</p>
          </div>
        </div>
      </TobiCard>

      <TobiCard class="p-4">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-success/10">
            <TobiIcon
              name="i-lucide-message-circle"
              class="w-6 h-6 text-success" />
          </div>
          <div>
            <p class="text-sm text-muted">Tổng đánh giá</p>
            <p class="text-2xl font-bold text-foreground">{{ totalReviews }}</p>
          </div>
        </div>
      </TobiCard>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TobiCard v-for="i in 4" :key="i" class="p-6">
        <div class="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
        <div class="h-64 bg-muted rounded animate-pulse" />
      </TobiCard>
    </div>

    <!-- Charts Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Most Viewed Products -->
      <TobiCard class="p-6">
        <h2
          class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <TobiIcon name="i-lucide-eye" class="w-5 h-5 text-primary" />
          Sản phẩm được xem nhiều nhất
        </h2>
        <div class="h-64">
          <Bar
            v-if="viewsChartData"
            :data="viewsChartData"
            :options="barChartOptions" />
          <div
            v-else
            class="h-full flex items-center justify-center text-muted">
            Không có dữ liệu
          </div>
        </div>
      </TobiCard>

      <!-- Most Reactions (Hearts) -->
      <TobiCard class="p-6">
        <h2
          class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <TobiIcon name="i-lucide-heart" class="w-5 h-5 text-error" />
          Sản phẩm được yêu thích nhất
        </h2>
        <div class="h-64">
          <Bar
            v-if="reactionsChartData"
            :data="reactionsChartData"
            :options="barChartOptions" />
          <div
            v-else
            class="h-full flex items-center justify-center text-muted">
            Không có dữ liệu
          </div>
        </div>
      </TobiCard>

      <!-- Most Saved Products -->
      <TobiCard class="p-6">
        <h2
          class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <TobiIcon name="i-lucide-bookmark" class="w-5 h-5 text-warning" />
          Sản phẩm được lưu nhiều nhất
        </h2>
        <div class="h-64">
          <Bar
            v-if="savesChartData"
            :data="savesChartData"
            :options="barChartOptions" />
          <div
            v-else
            class="h-full flex items-center justify-center text-muted">
            Không có dữ liệu
          </div>
        </div>
      </TobiCard>

      <!-- Most Commented Products -->
      <TobiCard class="p-6">
        <h2
          class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <TobiIcon
            name="i-lucide-message-circle"
            class="w-5 h-5 text-success" />
          Sản phẩm có nhiều đánh giá nhất
        </h2>
        <div class="h-64">
          <Bar
            v-if="reviewsChartData"
            :data="reviewsChartData"
            :options="barChartOptions" />
          <div
            v-else
            class="h-full flex items-center justify-center text-muted">
            Không có dữ liệu
          </div>
        </div>
      </TobiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

definePageMeta({
  layout: "admin",
});

interface ProductStat {
  id: string;
  name: string;
  count: number;
}

interface TopStatistics {
  topViews: ProductStat[];
  topReactions: ProductStat[];
  topSaves: ProductStat[];
  topReviews: ProductStat[];
}

const config = useRuntimeConfig();
const loading = ref(true);
const statistics = ref<TopStatistics | null>(null);

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        color: "#888",
        font: {
          size: 11,
        },
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: "#888",
      },
      grid: {
        color: "rgba(136, 136, 136, 0.1)",
      },
    },
  },
};

const createChartData = (items: ProductStat[], color: string) => {
  if (!items || items.length === 0) return null;

  return {
    labels: items.map((item) => truncateName(item.name)),
    datasets: [
      {
        data: items.map((item) => item.count),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 30,
      },
    ],
  };
};

const truncateName = (name: string, maxLength = 20) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
};

const viewsChartData = computed(() =>
  createChartData(statistics.value?.topViews || [], "rgba(59, 130, 246, 0.8)")
);

const reactionsChartData = computed(() =>
  createChartData(
    statistics.value?.topReactions || [],
    "rgba(239, 68, 68, 0.8)"
  )
);

const savesChartData = computed(() =>
  createChartData(statistics.value?.topSaves || [], "rgba(245, 158, 11, 0.8)")
);

const reviewsChartData = computed(() =>
  createChartData(statistics.value?.topReviews || [], "rgba(34, 197, 94, 0.8)")
);

// Calculate totals
const totalViews = computed(() =>
  (statistics.value?.topViews || []).reduce((sum, item) => sum + item.count, 0)
);

const totalReactions = computed(() =>
  (statistics.value?.topReactions || []).reduce(
    (sum, item) => sum + item.count,
    0
  )
);

const totalSaves = computed(() =>
  (statistics.value?.topSaves || []).reduce((sum, item) => sum + item.count, 0)
);

const totalReviews = computed(() =>
  (statistics.value?.topReviews || []).reduce(
    (sum, item) => sum + item.count,
    0
  )
);

const fetchStatistics = async () => {
  loading.value = true;
  try {
    const response = await $fetch<TopStatistics>(
      `${config.public.apiBaseUrl}/statistics/top`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        query: {
          limit: 10,
        },
      }
    );
    statistics.value = response;
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
  } finally {
    loading.value = false;
  }
};

const refreshStats = () => {
  fetchStatistics();
};

onMounted(() => {
  fetchStatistics();
});
</script>
