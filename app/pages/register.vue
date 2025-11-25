<template>
  <div class="min-h-screen flex items-center justify-center bg-muted">
    <TobiCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">Đăng ký tài khoản</h1>
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

        <TobiFormField name="confirmPassword" label="Xác nhận mật khẩu">
          <TobiInput
            v-model="formState.confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            required
            :disabled="authStore.loading"
            class="w-full" />
        </TobiFormField>

        <TobiAlert v-if="error" color="error" :title="error" />

        <TobiButton
          type="submit"
          block
          :loading="authStore.loading"
          :disabled="!canSubmit">
          Đăng ký
        </TobiButton>

        <div class="text-center text-sm">
          <span class="text-muted">Đã có tài khoản?</span>
          <TobiButton variant="link" to="/login" size="sm">
            Đăng nhập
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
  confirmPassword: "",
});

const error = ref("");

const canSubmit = computed(() => {
  return (
    formState.username &&
    formState.password &&
    formState.confirmPassword &&
    formState.password === formState.confirmPassword
  );
});

const handleSubmit = async () => {
  error.value = "";

  if (formState.password !== formState.confirmPassword) {
    error.value = "Mật khẩu xác nhận không khớp";
    return;
  }

  try {
    await authStore.register({
      username: formState.username,
      password: formState.password,
    });

    // Redirect based on role
    if (authStore.isAdmin) {
      router.push("/admin/products");
    } else {
      router.push("/user");
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Đăng ký thất bại";
  }
};
</script>
