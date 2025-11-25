import { defineStore } from "pinia";
import { api } from "~/utils/api";
import type { User, PaginatedUsers } from "~/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    meta: null as PaginatedUsers["meta"] | null,
    loading: false,
    cache: new Map<string, CacheEntry<PaginatedUsers>>(),
  }),

  actions: {
    async fetchUsers(
      page: number = 1,
      limit: number = 30,
      search?: string,
      status?: "NORMAL" | "BANNED",
      skipCache = false
    ) {
      const cacheKey = `users:${page}:${limit}:${search || ""}:${status || ""}`;

      // Check cache
      if (!skipCache) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          this.users = cached.data.items;
          this.meta = cached.data.meta;
          return cached.data;
        }
      }

      this.loading = true;
      try {
        const response = await api.getUsers(page, limit, search, status);
        this.users = response.items;
        this.meta = response.meta;

        // Update cache
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });

        return response;
      } finally {
        this.loading = false;
      }
    },

    async searchUsers(username: string) {
      return api.searchUsers(username);
    },

    async lockUser(id: string) {
      const updatedUser = await api.lockUser(id);

      // Update user in the list
      const index = this.users.findIndex((u) => u.id === id);
      if (index !== -1) {
        this.users[index] = updatedUser;
      }

      this.clearCache();
    },

    async unlockUser(id: string) {
      const updatedUser = await api.unlockUser(id);

      // Update user in the list
      const index = this.users.findIndex((u) => u.id === id);
      if (index !== -1) {
        this.users[index] = updatedUser;
      }

      this.clearCache();
    },

    clearCache() {
      this.cache.clear();
    },
  },
});
