// Domain model types

export type PhotoStatus = "QUEUED" | "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface PhotoSummary {
  photoId: string;
  filename: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
  status: PhotoStatus;
  createdAt: string;
  completedAt?: string;
  tags: string[];
}

export interface Photo extends PhotoSummary {
  s3Key: string;
  exifJson?: Record<string, any>;
}

export interface User {
  userId: string;
  email: string;
}

export interface UploadJob {
  jobId: string;
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  totalCount: number;
  completedCount: number;
  failedCount: number;
  items: Array<{
    photoId: string;
    status: PhotoStatus;
    progressPercent: number;
  }>;
}

export interface UploadFile {
  file: File;
  photoId?: string;
  status: PhotoStatus;
  progress: number;
  error?: string;
}

