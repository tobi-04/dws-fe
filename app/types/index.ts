import type {
  Role,
  UserStatus,
  ImportJobStatus,
  NotificationType,
  Notification,
  PaginatedNotifications,
  DevToolsUserStats,
  PaginatedDevToolsStats,
} from "./api-types";

export type {
  ImportJobStatus,
  NotificationType,
  Notification,
  PaginatedNotifications,
  DevToolsUserStats,
  PaginatedDevToolsStats,
};

export interface JwtUser {
  id: string;
  username: string;
  role: Role;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    role: Role;
    status: UserStatus;
  };
}

export interface User {
  id: string;
  username: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsers {
  items: User[];
  meta: PaginationMeta;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  status: "PUBLISHED" | "PRIVATE" | "WHITELIST";
  whitelistUserIds: string[];
  isDeleted: boolean;
  deletedAt: string | null;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  items: Product[];
  meta: PaginationMeta;
}

export interface CreateProductDto {
  name: string;
  imageUrl?: string;
  file?: File;
  status?: "PUBLISHED" | "PRIVATE" | "WHITELIST";
  whitelistUserIds?: string[];
}

export interface UpdateProductDto {
  name?: string;
  imageUrl?: string;
  file?: File;
  status?: "PUBLISHED" | "PRIVATE" | "WHITELIST";
  whitelistUserIds?: string[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  username: string;
  content: string;
  parentId: string | null;
  isHidden: boolean;
  likes: number;
  dislikes: number;
  userReaction: boolean | null; // true = like, false = dislike, null = none
  replyCount: number;
  replies?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReviews {
  items: Review[];
  meta: PaginationMeta;
}

export interface CreateReviewDto {
  productId: string;
  content: string;
  parentId?: string;
}

export interface UpdateReviewDto {
  content: string;
}

export interface ProductWithMeta extends Product {
  reactionCount: number;
  isReacted: boolean;
  isSaved: boolean;
}
