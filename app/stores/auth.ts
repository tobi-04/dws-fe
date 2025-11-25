import { defineStore } from "pinia";
import { api } from "~/utils/api";
import type { JwtUser, LoginDto, RegisterDto } from "~/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as JwtUser | null,
    token: null as string | null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "ADMIN",
  },

  actions: {
    async login(dto: LoginDto) {
      this.loading = true;
      try {
        const response = await api.login(dto);
        this.token = response.access_token;
        this.user = {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
        };

        if (import.meta.client) {
          localStorage.setItem("token", response.access_token);
          localStorage.setItem("user", JSON.stringify(this.user));
        }

        return response;
      } finally {
        this.loading = false;
      }
    },

    async register(dto: RegisterDto) {
      this.loading = true;
      try {
        const response = await api.register(dto);
        this.token = response.access_token;
        this.user = {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
        };

        if (import.meta.client) {
          localStorage.setItem("token", response.access_token);
          localStorage.setItem("user", JSON.stringify(this.user));
        }

        return response;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await api.getProfile();
        this.user = {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
        };
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.initialized = false;

      if (import.meta.client) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    },

    initFromStorage() {
      if (this.initialized) return;

      if (import.meta.client) {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          this.token = token;
          try {
            this.user = JSON.parse(userStr);
          } catch {
            this.logout();
          }
        }
      }

      this.initialized = true;
    },
  },
});
