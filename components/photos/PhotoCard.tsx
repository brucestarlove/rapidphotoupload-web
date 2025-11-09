"use client";

import { useState } from "react";
import Image from "next/image";
import type { PhotoSummary } from "@/types/domain";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatRelativeTime, truncate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Eye, Download } from "lucide-react";
import { getDownloadUrl } from "@/lib/api/photos";

interface PhotoCardProps {
  photo: PhotoSummary;
  onClick: () => void;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(photo.thumbnailUrl || null);
  const [isHovered, setIsHovered] = useState(false);

  // Handle image load error - fallback to download URL
  const handleImageError = async () => {
    if (imageError) return; // Already tried fallback
    setImageError(true);
    
    // Try to fetch the full image download URL as fallback
    try {
      const downloadData = await getDownloadUrl(photo.photoId);
      if (downloadData.url) {
        setImageUrl(downloadData.url);
        setImageError(false); // Reset error state to try again
      }
    } catch (error) {
      console.warn("Failed to fetch download URL for photo:", photo.photoId, error);
    }
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="aspect-square relative bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
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
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              className="rounded-full bg-card p-3 text-card-foreground hover:bg-card/90"
              onClick={(e) => {
                e.stopPropagation();
                // Download placeholder for Phase 3
              }}
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
}

