import apiClient from "./client";
import type { PhotoListResponse, PhotoMetadataResponse, DownloadUrlResponse } from "@/types/api";

/**
 * Get photos list with pagination
 */
export async function getPhotos(params?: {
  page?: number;
  size?: number;
  tag?: string;
  status?: string;
  search?: string;
}): Promise<PhotoListResponse> {
  const response = await apiClient.get<PhotoListResponse>("/queries/photos", { 
    params: {
      ...params,
      status: params?.status || "COMPLETED", // Default to COMPLETED status
    }
  });
  // Ensure response has the expected structure
  const data = response.data;
  return {
    items: data?.items || [],
    page: data?.page ?? 0,
    size: data?.size ?? 50,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
  };
}

/**
 * Get photo metadata by ID
 */
export async function getPhoto(photoId: string): Promise<PhotoMetadataResponse> {
  const response = await apiClient.get<PhotoMetadataResponse>(`/queries/photos/${photoId}`);
  return response.data;
}

/**
 * Get download URL for photo
 */
export async function getDownloadUrl(photoId: string): Promise<DownloadUrlResponse> {
  const response = await apiClient.get<DownloadUrlResponse>(`/queries/photos/${photoId}/download-url`);
  return response.data;
}

/**
 * Soft delete a photo (moves to trash)
 */
export async function deletePhoto(photoId: string): Promise<void> {
  await apiClient.delete(`/commands/photos/${photoId}`);
}

/**
 * Restore a photo from trash
 */
export async function restorePhoto(photoId: string): Promise<void> {
  await apiClient.post(`/commands/photos/${photoId}/restore`);
}

/**
 * Permanently delete a photo (only if deleted >7 days ago)
 */
export async function permanentDeletePhoto(photoId: string): Promise<void> {
  await apiClient.delete(`/commands/photos/${photoId}/permanent`);
}

/**
 * Get photos from trash
 */
export async function getTrashPhotos(params?: {
  page?: number;
  size?: number;
}): Promise<PhotoListResponse> {
  const response = await apiClient.get<PhotoListResponse>("/queries/photos/trash", {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 50,
    },
  });
  // Ensure response has the expected structure
  const data = response.data;
  return {
    items: data?.items || [],
    page: data?.page ?? 0,
    size: data?.size ?? 50,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
  };
}

