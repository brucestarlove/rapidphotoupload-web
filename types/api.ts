// API request/response types
import type { PhotoSummary } from "./domain";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  userId: string;
  email: string;
}

export interface CreateUploadJobRequest {
  files: Array<{
    filename: string;
    mimeType: string;
    bytes: number;
  }>;
  strategy: "s3-presigned";
}

export interface CreateUploadJobResponse {
  jobId: string;
  items: Array<CreateUploadJobResponseItem>;
}

export interface UpdateProgressRequest {
  photoId: string;
  bytesSent: number;
  bytesTotal: number;
}

export interface PhotoListResponse {
  items: Array<PhotoSummary>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PhotoMetadataResponse {
  photoId: string;
  filename: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
  s3Key: string;
  thumbnailUrl?: string | null; // 256px thumbnail
  thumbnailUrl1024?: string | null; // 1024px thumbnail (if available)
  fullImageUrl?: string | null; // Full size image URL (if available)
  exifJson?: Record<string, any>;
  status: string;
  createdAt: string;
  completedAt?: string;
  tags?: string[];
}

export interface DownloadUrlResponse {
  url: string;
  expiresAt: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  totalCount: number;
  completedCount: number;
  failedCount: number;
  items: Array<{
    photoId: string;
    status: string;
    progressPercent: number;
  }>;
}

export interface ProgressUpdate {
  jobId: string;
  photoId: string;
  status: string;
  progressPercent: number;
  message?: string;
  timestamp: string;
}

export interface JobStatusUpdate {
  jobId: string;
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  totalCount: number;
  completedCount: number;
  failedCount: number;
  timestamp: string;
}

export interface FinalizeMultipartUploadRequest {
  uploadId: string;
  parts: Array<{
    partNumber: number;
    etag: string;
  }>;
}

export interface CreateUploadJobResponseItem {
  photoId: string;
  method: "PUT";
  presignedUrl: string;
  multipart?: {
    uploadId: string;
    partSize: number;
    partUrls: Array<{
      partNumber: number;
      presignedUrl: string;
    }>;
  };
}

