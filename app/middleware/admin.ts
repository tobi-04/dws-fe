export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.initFromStorage();

  // Kiểm tra token và user đã được khởi tạo
  if (!auth.token || !auth.user) {
    return navigateTo("/login");
  }

  // Kiểm tra role phải là ADMIN
  if (auth.user.role !== "ADMIN") {
    return navigateTo("/user");
  }

  // Verify token với server nếu cần (optional - thêm bảo mật)
  try {
    await auth.fetchCurrentUser();
    if (auth.user?.role !== "ADMIN") {
      return navigateTo("/user");
    }
  } catch {
    // Token không hợp lệ hoặc hết hạn
    auth.logout();
    return navigateTo("/login");
  }
});
