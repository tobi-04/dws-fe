import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  User,
  PaginatedUsers,
  Product,
  PaginatedProducts,
  CreateProductDto,
  UpdateProductDto,
  ImportJobStatus,
  PaginatedNotifications,
  Notification,
  PaginatedDevToolsStats,
} from "~/types";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiClient {
  private getApiBase(): string {
    const config = useRuntimeConfig();
    return config.public.apiBaseUrl as string;
  }

  private getToken(): string | null {
    if (import.meta.client) {
      return localStorage.getItem("token");
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {}, requiresAuth = true } = options;

    const token = this.getToken();

    if (requiresAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (body && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const apiBase = this.getApiBase();
    const response = await fetch(`${apiBase}${endpoint}`, config);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));

      // Check if account is banned/locked
      const errorMessage = error.message || "";
      if (
        response.status === 403 &&
        (errorMessage.toLowerCase().includes("locked") ||
          errorMessage.toLowerCase().includes("banned"))
      ) {
        // Trigger banned state globally
        if (import.meta.client) {
          const { setBanned } = useBannedUser();
          setBanned(true);
        }
      }

      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(dto: LoginDto): Promise<AuthResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: dto,
      requiresAuth: false,
    });
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    return this.request("/auth/register", {
      method: "POST",
      body: dto,
      requiresAuth: false,
    });
  }

  async getProfile(): Promise<{ user: User }> {
    return this.request("/auth/profile");
  }

  // User endpoints
  async getUsers(
    page: number = 1,
    limit: number = 30,
    search?: string,
    status?: "NORMAL" | "BANNED"
  ): Promise<PaginatedUsers> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    return this.request(`/users?${params.toString()}`);
  }

  async searchUsers(username: string): Promise<User[]> {
    return this.request(
      `/users/search?username=${encodeURIComponent(username)}`
    );
  }

  async lockUser(id: string): Promise<User> {
    return this.request(`/users/${id}/lock`, { method: "PATCH" });
  }

  async unlockUser(id: string): Promise<User> {
    return this.request(`/users/${id}/unlock`, { method: "PATCH" });
  }

  // Product endpoints
  async getProducts(
    page: number = 1,
    limit: number = 12,
    search?: string,
    status?: string
  ): Promise<PaginatedProducts> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    return this.request(`/products?${params.toString()}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request(`/products/${id}`);
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const formData = new FormData();
    formData.append("name", dto.name);

    if (dto.imageUrl) {
      formData.append("imageUrl", dto.imageUrl);
    }

    if (dto.file) {
      formData.append("file", dto.file);
    }

    if (dto.status) {
      formData.append("status", dto.status);
    }

    if (dto.whitelistUserIds && dto.whitelistUserIds.length > 0) {
      formData.append("whitelistUserIds", JSON.stringify(dto.whitelistUserIds));
    }

    return this.request("/products", {
      method: "POST",
      body: formData,
    });
  }

  async bulkCreateProducts(products: CreateProductDto[]): Promise<Product[]> {
    return this.request("/products/bulk", {
      method: "POST",
      body: { products },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const formData = new FormData();

    if (dto.name) {
      formData.append("name", dto.name);
    }

    if (dto.imageUrl) {
      formData.append("imageUrl", dto.imageUrl);
    }

    if (dto.file) {
      formData.append("file", dto.file);
    }

    if (dto.status) {
      formData.append("status", dto.status);
    }

    if (dto.whitelistUserIds !== undefined) {
      formData.append("whitelistUserIds", JSON.stringify(dto.whitelistUserIds));
    }

    return this.request(`/products/${id}`, {
      method: "PATCH",
      body: formData,
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request(`/products/${id}/soft`, { method: "DELETE" });
  }

  async hardDeleteProduct(id: string): Promise<void> {
    return this.request(`/products/${id}/hard`, { method: "DELETE" });
  }

  async getTrashedProducts(
    page: number = 1,
    limit: number = 12,
    search?: string,
    status?: string
  ): Promise<PaginatedProducts> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    return this.request(`/products/trash?${params.toString()}`);
  }

  async bulkSoftDeleteProducts(ids: string[]): Promise<void> {
    return this.request("/products/bulk-soft-delete", {
      method: "POST",
      body: { productIds: ids },
    });
  }

  async bulkHardDeleteProducts(ids: string[]): Promise<void> {
    return this.request("/products/bulk-hard-delete", {
      method: "POST",
      body: { productIds: ids },
    });
  }

  async hardDeleteAllProducts(): Promise<{ message: string; count: number }> {
    return this.request("/products/hard-delete-all", {
      method: "DELETE",
    });
  }

  async restoreProducts(ids: string[]): Promise<void> {
    return this.request("/products/restore", {
      method: "POST",
      body: { productIds: ids },
    });
  }

  async importExcel(file: File): Promise<ImportJobStatus> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request("/products/import-excel", {
      method: "POST",
      body: formData,
    });
  }

  async getImportStatus(jobId: string): Promise<ImportJobStatus> {
    return this.request(`/products/import-status/${jobId}`);
  }

  // ========== Notifications ==========
  async getNotifications(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedNotifications> {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.request("/notifications/unread-count");
  }

  async markNotificationAsRead(
    notificationId?: string,
    all?: boolean
  ): Promise<void> {
    return this.request("/notifications/mark-read", {
      method: "POST",
      body: { notificationId, all },
    });
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request(`/notifications/${id}`, { method: "DELETE" });
  }

  async sendNotification(
    userId: string,
    title: string,
    content: string
  ): Promise<Notification> {
    return this.request("/notifications/send", {
      method: "POST",
      body: { userId, title, content },
    });
  }

  // ========== DevTools Logs ==========
  async logDevTools(path: string, userAgent?: string): Promise<void> {
    return this.request("/devtools/log", {
      method: "POST",
      body: { path, userAgent },
    });
  }

  async getDevToolsTodayCount(): Promise<{ count: number }> {
    return this.request("/devtools/today-count");
  }

  async getFrequentDevToolsUsers(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedDevToolsStats> {
    return this.request(`/devtools/frequent-users?page=${page}&limit=${limit}`);
  }
}

export const api = new ApiClient();
