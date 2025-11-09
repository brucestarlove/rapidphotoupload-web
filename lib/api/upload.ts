import apiClient from "./client";
import type { CreateUploadJobRequest, CreateUploadJobResponse, UpdateProgressRequest } from "@/types/api";

/**
 * Create upload job
 */
export async function createUploadJob(data: CreateUploadJobRequest): Promise<CreateUploadJobResponse> {
  const response = await apiClient.post<CreateUploadJobResponse>("/commands/upload-jobs", data);
  return response.data;
}

/**
 * Update upload progress (best-effort)
 */
export async function updateProgress(data: UpdateProgressRequest): Promise<void> {
  try {
    await apiClient.post("/commands/upload/progress", data);
  } catch (error) {
    // Best-effort, don't throw error
    console.warn("Failed to update progress:", error);
  }
}

