<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-3xl font-bold text-foreground">Quản lý người dùng</h2>
      <div class="flex gap-2">
        <TobiInput
          v-model="searchQuery"
          placeholder="Tìm kiếm người dùng..."
          class="w-64"
          @input="handleSearch" />
      </div>
    </div>

    <TobiCard>
      <div v-if="userStore.loading" class="py-12 text-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <div v-else>
        <!-- User Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted border-b">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Tên đăng nhập
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Vai trò
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Trạng thái
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-secondary">
              <tr v-for="user in userStore.users" :key="user.id">
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {{ user.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  <TobiBadge :color="user.role === 'ADMIN' ? 'error' : 'info'">
                    {{ user.role }}
                  </TobiBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  <TobiBadge
                    :color="user.status === 'BANNED' ? 'warning' : 'success'">
                    {{ user.status === "BANNED" ? "Đã khóa" : "Bình thường" }}
                  </TobiBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  {{ new Date(user.createdAt).toLocaleDateString("vi-VN") }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <TobiButton
                      v-if="user.status !== 'BANNED'"
                      color="warning"
                      variant="soft"
                      size="sm"
                      @click="handleLock(user.id)">
                      <TobiIcon name="i-lucide-lock" class="w-4 h-4" />
                      Khóa
                    </TobiButton>
                    <TobiButton
                      v-else
                      color="success"
                      variant="soft"
                      size="sm"
                      @click="handleUnlock(user.id)">
                      <TobiIcon name="i-lucide-unlock" class="w-4 h-4" />
                      Mở khóa
                    </TobiButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="userStore.meta"
          class="mt-6 flex justify-between items-center">
          <div class="text-sm text-muted">
            Hiển thị {{ userStore.users.length }} /
            {{ userStore.meta.total }} người dùng
          </div>
          <div class="flex gap-2">
            <TobiButton
              :disabled="userStore.meta.page <= 1"
              variant="outline"
              size="sm"
              @click="changePage(userStore.meta!.page - 1)">
              Trước
            </TobiButton>
            <span class="px-4 py-2 text-sm">
              Trang {{ userStore.meta.page }} / {{ userStore.meta.totalPages }}
            </span>
            <TobiButton
              :disabled="userStore.meta.page >= userStore.meta.totalPages"
              variant="outline"
              size="sm"
              @click="changePage(userStore.meta!.page + 1)">
              Sau
            </TobiButton>
          </div>
        </div>
      </div>
    </TobiCard>

    <!-- Lock User Confirmation Dialog -->
    <TobiModal
      :open="showLockDialog"
      @update:open="(v) => (showLockDialog = v)"
      :title="
        lockAction === 'lock' ? 'Xác nhận khóa người dùng' : 'Xác nhận mở khóa'
      ">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            {{
              lockAction === "lock"
                ? "Bạn có chắc chắn muốn khóa người dùng này? Người dùng sẽ không thể đăng nhập."
                : "Bạn có chắc chắn muốn mở khóa người dùng này?"
            }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <TobiButton variant="outline" @click="showLockDialog = false">
            Hủy
          </TobiButton>
          <TobiButton
            :color="lockAction === 'lock' ? 'warning' : 'success'"
            @click="confirmLockAction">
            {{ lockAction === "lock" ? "Khóa" : "Mở khóa" }}
          </TobiButton>
        </div>
      </template>
    </TobiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin",
});

const toast = useToast();

const userStore = useUserStore();

const showLockDialog = ref(false);
const lockAction = ref<"lock" | "unlock">("lock");
const userIdToLock = ref<string | null>(null);
const searchQuery = ref("");

onMounted(async () => {
  await userStore.fetchUsers();
});

const changePage = async (page: number) => {
  await userStore.fetchUsers(page, 30, searchQuery.value);
};

const handleSearch = useDebounceFn(async () => {
  await userStore.fetchUsers(1, 30, searchQuery.value);
}, 300);

const handleLock = (id: string) => {
  userIdToLock.value = id;
  lockAction.value = "lock";
  showLockDialog.value = true;
};

const handleUnlock = (id: string) => {
  userIdToLock.value = id;
  lockAction.value = "unlock";
  showLockDialog.value = true;
};

const confirmLockAction = async () => {
  if (!userIdToLock.value) return;

  showLockDialog.value = false;

  try {
    if (lockAction.value === "lock") {
      await userStore.lockUser(userIdToLock.value);
      toast.add({
        title: "Khóa thành công",
        description: "Người dùng đã bị khóa",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      await userStore.unlockUser(userIdToLock.value);
      toast.add({
        title: "Mở khóa thành công",
        description: "Người dùng đã được mở khóa",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    }
  } catch (error) {
    console.error("Thao tác thất bại:", error);
    toast.add({
      title:
        lockAction.value === "lock"
          ? "Khóa người dùng thất bại"
          : "Mở khóa người dùng thất bại",
      description: "Vui lòng thử lại",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    userIdToLock.value = null;
  }
};
</script>
