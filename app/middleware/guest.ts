export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.initFromStorage();

  if (auth.isAuthenticated) {
    if (auth.isAdmin) return navigateTo("/admin/products");
    return navigateTo("/user");
  }
});
