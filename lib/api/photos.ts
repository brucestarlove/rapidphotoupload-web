import apiClient from "./client";
import type { PhotoListResponse, PhotoMetadataResponse, DownloadUrlResponse } from "@/types/api";

/**
 * Get photos list with pagination
 */
export async function getPhotos(params?: {
  page?: number;
  size?: number;
  tag?: string;
}): Promise<PhotoListResponse> {
  const response = await apiClient.get<PhotoListResponse>("/queries/photos", { params });
  // Ensure response has the expected structure
  const data = response.data;
  return {
    photos: data?.photos || [],
    total: data?.total || 0,
    page: data?.page || 0,
    size: data?.size || 50,
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

