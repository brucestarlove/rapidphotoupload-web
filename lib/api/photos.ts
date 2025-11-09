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

