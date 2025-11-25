import { defineStore } from "pinia";
import { api } from "~/utils/api";
import type {
  Product,
  PaginatedProducts,
  CreateProductDto,
  UpdateProductDto,
  ImportJobStatus,
} from "~/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useProductStore = defineStore("product", {
  state: () => ({
    products: [] as Product[],
    meta: null as PaginatedProducts["meta"] | null,
    currentProduct: null as Product | null,
    loading: false,
    cache: new Map<string, CacheEntry<PaginatedProducts>>(),
  }),

  actions: {
    async fetchProducts(
      page: number = 1,
      limit: number = 12,
      search?: string,
      status?: string,
      skipCache = false
    ) {
      const cacheKey = `products:${page}:${limit}:${search || ""}:${
        status || ""
      }`;

      // Check cache
      if (!skipCache) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          this.products = cached.data.items;
          this.meta = cached.data.meta;
          return cached.data;
        }
      }

      this.loading = true;
      try {
        const response = await api.getProducts(page, limit, search, status);
        this.products = response.items;
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

    async fetchProduct(id: string) {
      this.loading = true;
      try {
        const product = await api.getProduct(id);
        this.currentProduct = product;
        return product;
      } finally {
        this.loading = false;
      }
    },

    async createProduct(dto: CreateProductDto) {
      const product = await api.createProduct(dto);

      // Add new product to the beginning of the list
      this.products.unshift(product);

      // Update meta total count
      if (this.meta) {
        this.meta.total += 1;
      }

      // Clear cache to ensure fresh data on next fetch
      this.clearCache();

      return product;
    },

    async bulkCreateProducts(dtos: CreateProductDto[]) {
      const newProducts = await api.bulkCreateProducts(dtos);

      // Add new products to the beginning of the list
      this.products.unshift(...newProducts);

      // Update meta total count
      if (this.meta) {
        this.meta.total += newProducts.length;
      }

      // Clear cache to ensure fresh data on next fetch
      this.clearCache();

      return newProducts;
    },

    async updateProduct(id: string, dto: UpdateProductDto) {
      const product = await api.updateProduct(id, dto);

      // Update product in the list
      const index = this.products.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.products[index] = product;
      }

      // Update current product if it matches
      if (this.currentProduct?.id === id) {
        this.currentProduct = product;
      }

      // Clear cache to ensure consistency
      this.clearCache();

      return product;
    },

    async deleteProduct(id: string) {
      await api.deleteProduct(id);

      // Xóa product khỏi mảng
      const index = this.products.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.products.splice(index, 1);
      }

      // Cập nhật meta total
      if (this.meta) {
        this.meta.total -= 1;
      }

      // Clear cache
      this.clearCache();
    },

    async hardDeleteProduct(id: string) {
      await api.hardDeleteProduct(id);

      // Xóa product khỏi mảng
      const index = this.products.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.products.splice(index, 1);
      }

      // Cập nhật meta total
      if (this.meta) {
        this.meta.total -= 1;
      }

      // Clear cache
      this.clearCache();
    },

    async bulkSoftDeleteProducts(ids: string[]) {
      await api.bulkSoftDeleteProducts(ids);

      // Remove products from list
      this.products = this.products.filter((p) => !ids.includes(p.id));

      // Update meta total
      if (this.meta) {
        this.meta.total -= ids.length;
      }

      this.clearCache();
    },

    async bulkHardDeleteProducts(ids: string[]) {
      await api.bulkHardDeleteProducts(ids);

      // Remove products from list
      this.products = this.products.filter((p) => !ids.includes(p.id));

      // Update meta total
      if (this.meta) {
        this.meta.total -= ids.length;
      }

      this.clearCache();
    },

    async fetchTrashedProducts(
      page: number = 1,
      limit: number = 12,
      search?: string,
      status?: string
    ) {
      this.loading = true;
      try {
        const response = await api.getTrashedProducts(
          page,
          limit,
          search,
          status
        );
        this.products = response.items;
        this.meta = response.meta;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async restoreProducts(ids: string[]) {
      await api.restoreProducts(ids);

      // Remove restored products from the list (since we are in trash view)
      this.products = this.products.filter((p) => !ids.includes(p.id));

      // Update meta total
      if (this.meta) {
        this.meta.total -= ids.length;
      }

      this.clearCache();
    },

    clearCache() {
      this.cache.clear();
    },

    async importExcel(file: File): Promise<ImportJobStatus> {
      return await api.importExcel(file);
    },

    async getImportStatus(jobId: string): Promise<ImportJobStatus> {
      return await api.getImportStatus(jobId);
    },
  },
});
