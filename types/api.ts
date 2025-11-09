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
  items: Array<{
    photoId: string;
    method: "PUT";
    presignedUrl: string;
    multipart?: {
      uploadId: string;
      partSize: number;
    };
  }>;
}

export interface UpdateProgressRequest {
  photoId: string;
  bytesSent: number;
  bytesTotal: number;
}

export interface PhotoListResponse {
  photos: Array<PhotoSummary>;
  total: number;
  page: number;
  size: number;
}

export interface PhotoMetadataResponse {
  photoId: string;
  filename: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
  s3Key: string;
  exifJson?: Record<string, any>;
  status: string;
  createdAt: string;
  completedAt?: string;
  tags: string[];
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

