import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getPhotos, getPhoto, getDownloadUrl } from "@/lib/api/photos";
import { isConnectionError } from "@/lib/utils/errors";

export function usePhotos(params?: { page?: number; size?: number; tag?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ["photos", params],
    queryFn: async () => {
      try {
        return await getPhotos(params);
      } catch (error) {
        // Re-throw connection errors so they can be handled in the UI
        if (isConnectionError(error)) {
          throw error;
        }
        // Return empty result for other API errors (e.g., endpoint doesn't exist yet)
        console.warn("Failed to fetch photos:", error);
        return {
          items: [],
          page: params?.page ?? 0,
          size: params?.size ?? 50,
          totalElements: 0,
          totalPages: 0,
        };
      }
    },
    retry: false, // Don't retry on failure for now
  });
}

export function usePhoto(photoId: string | null) {
  return useQuery({
    queryKey: ["photo", photoId],
    queryFn: () => (photoId ? getPhoto(photoId) : null),
    enabled: !!photoId,
  });
}

export function useDownloadUrl(photoId: string | null) {
  return useQuery({
    queryKey: ["downloadUrl", photoId],
    queryFn: () => (photoId ? getDownloadUrl(photoId) : null),
    enabled: !!photoId,
    staleTime: 14 * 60 * 1000, // 14 minutes (URLs expire in 15 minutes)
  });
}

/**
 * Prefetch download URL for a photo (useful for hover prefetching)
 */
export function usePrefetchDownloadUrl() {
  const queryClient = useQueryClient();
  
  return useCallback((photoId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["downloadUrl", photoId],
      queryFn: () => getDownloadUrl(photoId),
      staleTime: 14 * 60 * 1000,
    });
  }, [queryClient]);
}

