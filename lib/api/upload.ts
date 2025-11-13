import apiClient from "./client";
import type {
  CreateUploadJobRequest,
  CreateUploadJobResponse,
  UpdateProgressRequest,
  FinalizeMultipartUploadRequest,
  JobStatusResponse,
} from "@/types/api";

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

/**
 * Finalize multipart upload
 */
export async function finalizeMultipartUpload(
  photoId: string,
  data: FinalizeMultipartUploadRequest
): Promise<void> {
  await apiClient.post(`/commands/upload/${photoId}/finalize`, data);
  // Backend returns 204 No Content, so no data to return
  return;
}

/**
 * Get job status (for polling)
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await apiClient.get<JobStatusResponse>(`/queries/upload-jobs/${jobId}`);
  return response.data;
}

