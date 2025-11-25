export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.initFromStorage();

  if (!auth.isAdmin) {
    return navigateTo("/user");
  }
});
