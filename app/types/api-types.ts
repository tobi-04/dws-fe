export type Role = "ADMIN" | "USER";
export type UserStatus = "NORMAL" | "BANNED";
export type ProductStatus = "PUBLISHED" | "PRIVATE" | "WHITELIST";
export type NotificationType =
  | "SYSTEM"
  | "WARNING"
  | "ACCOUNT_LOCKED"
  | "REVIEW_LIKE"
  | "REVIEW_REPLY"
  | "PRODUCT_LIKE"
  | "PRODUCT_COMMENT"
  | "PRODUCT_SAVE"
  | "ADMIN_MESSAGE";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DevToolsUserStats {
  userId: string;
  username: string;
  count: number;
  lastDetected: string;
}

export interface PaginatedDevToolsStats {
  data: DevToolsUserStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ImportJobStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  total: number;
  processed: number;
  successful: number;
  failed: number;
  error?: string;
  products?: Product[];
}
