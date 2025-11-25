<template>
  <div class="min-h-screen flex items-center justify-center bg-muted">
    <TobiCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">Đăng nhập</h1>
      </template>

      <TobiForm :state="formState" @submit="handleSubmit" class="space-y-4">
        <TobiFormField name="username" label="Tên đăng nhập">
          <TobiInput
            v-model="formState.username"
            placeholder="Nhập tên đăng nhập"
            required
            :disabled="authStore.loading"
            class="w-full" />
        </TobiFormField>

        <TobiFormField name="password" label="Mật khẩu">
          <TobiInput
            v-model="formState.password"
            type="password"
            placeholder="Nhập mật khẩu"
            required
            :disabled="authStore.loading"
            class="w-full" />
        </TobiFormField>

        <TobiAlert v-if="error" color="error" :title="error" />

        <TobiButton
          type="submit"
          block
          :loading="authStore.loading"
          :disabled="!formState.username || !formState.password">
          Đăng nhập
        </TobiButton>

        <div class="text-center text-sm">
          <span class="text-muted">Chưa có tài khoản?</span>
          <TobiButton variant="link" to="/register" size="sm">
            Đăng ký ngay
          </TobiButton>
        </div>
      </TobiForm>
    </TobiCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "guest",
  layout: false,
  ssr: false,
});

const authStore = useAuthStore();
const router = useRouter();

const formState = reactive({
  username: "",
  password: "",
});

const error = ref("");

const handleSubmit = async () => {
  error.value = "";

  try {
    await authStore.login(formState);

    // Redirect based on role
    if (authStore.isAdmin) {
      router.push("/admin/products");
    } else {
      router.push("/user");
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Đăng nhập thất bại";
  }
};
</script>
