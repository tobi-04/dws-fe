export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.initFromStorage();

  // Exclude login and register pages
  if (to.path === "/login" || to.path === "/register") {
    return;
  }

  // Chưa login → chuyển login
  if (!auth.token) {
    return navigateTo("/login");
  }
});
