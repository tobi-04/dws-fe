export type Role = "ADMIN" | "USER";
export type UserStatus = "NORMAL" | "BANNED";
export type ProductStatus = "PUBLISHED" | "PRIVATE" | "WHITELIST";

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
