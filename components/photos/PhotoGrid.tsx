"use client";

import { usePhotos } from "@/hooks/usePhotos";
import { PhotoCard } from "./PhotoCard";
import { UploadZone } from "@/components/upload/UploadZone";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { isConnectionError } from "@/lib/utils/errors";
import type { PhotoSummary } from "@/types/domain";

interface PhotoGridProps {
  onPhotoClick: (photo: PhotoSummary) => void;
}

export function PhotoGrid({ onPhotoClick }: PhotoGridProps) {
  const { data, isLoading, error } = usePhotos({ page: 0, size: 50 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  // Show connection error message instead of upload zone
  if (error && isConnectionError(error)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="mb-2 text-lg font-semibold text-destructive">
          Cannot connect to server
        </h3>
        <p className="mb-4 text-sm text-muted-foreground max-w-md">
          Unable to connect to the backend server. Please check that the server is running
          and that the API URL is configured correctly.
        </p>
        <p className="text-xs text-muted-foreground">
          Check your <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_API_URL</code> environment variable
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">Failed to load photos</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="space-y-6">
        <UploadZone />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">No photos yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload your first photo to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UploadZone />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {data.items.map((photo) => (
          <PhotoCard 
            key={photo.photoId} 
            photo={photo} 
            onClick={() => onPhotoClick(photo)} 
          />
        ))}
      </div>
    </div>
  );
}

