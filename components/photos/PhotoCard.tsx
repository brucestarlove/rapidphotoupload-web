"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import type { PhotoSummary } from "@/types/domain";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatRelativeTime, truncate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Eye, Download } from "lucide-react";
import { usePrefetchDownloadUrl } from "@/hooks/usePhotos";

interface PhotoCardProps {
  photo: PhotoSummary;
  onClick: () => void;
}

export const PhotoCard = memo(function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefetchDownloadUrl = usePrefetchDownloadUrl();

  // Use presigned thumbnail URL directly from API response - no additional API calls needed
  const thumbnailUrl = photo.thumbnailUrl || null;

  // Prefetch full-size image URL on hover for better UX
  useEffect(() => {
    if (isHovered && photo.status === "COMPLETED") {
      // Prefetch the download URL using React Query (cached for reuse)
      prefetchDownloadUrl(photo.photoId);
    }
  }, [isHovered, photo.photoId, photo.status, prefetchDownloadUrl]);

  // Handle image load error - memoized to prevent unnecessary re-renders
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Handle download - memoized to prevent unnecessary re-renders
  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getDownloadUrl } = await import("@/lib/api/photos");
      const downloadData = await getDownloadUrl(photo.photoId);
      if (downloadData.url) {
        // Create a temporary link to trigger download
        const link = document.createElement("a");
        link.href = downloadData.url;
        link.download = photo.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Failed to download photo:", error);
    }
  }, [photo.photoId, photo.filename]);

  // Handle view click - memoized to prevent unnecessary re-renders
  const handleViewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="aspect-square relative bg-muted">
        {thumbnailUrl && !imageError ? (
          <Image
            src={thumbnailUrl}
            alt={photo.filename}
            fill
            className="object-cover"
            onError={handleImageError}
            loading="lazy"
            unoptimized // Presigned URLs are already optimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground">
              {photo.status === "PROCESSING" || photo.status === "UPLOADING" 
                ? "Processing..." 
                : photo.status === "FAILED"
                ? "Failed"
                : "No preview"}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 transition-opacity">
            <button
              className="rounded-full bg-primary p-3 text-primary-foreground hover:bg-primary/90"
              onClick={handleViewClick}
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              className="rounded-full bg-card p-3 text-card-foreground hover:bg-card/90"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <Badge
            variant={
              photo.status === "COMPLETED"
                ? "default"
                : photo.status === "FAILED"
                ? "destructive"
                : "secondary"
            }
          >
            {photo.status}
          </Badge>
        </div>
      </div>

      {/* File info */}
      <div className="p-3">
        <p className="text-sm font-medium truncate" title={photo.filename}>
          {truncate(photo.filename, 30)}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(photo.bytes)}</span>
          <span>•</span>
          <span>{formatRelativeTime(photo.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
});

