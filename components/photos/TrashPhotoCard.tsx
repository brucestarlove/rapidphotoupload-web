"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import type { PhotoSummary } from "@/types/domain";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatRelativeTime, truncate } from "@/lib/utils/format";
import { Eye, Download, RotateCcw, Trash2 } from "lucide-react";
import { usePrefetchDownloadUrl } from "@/hooks/usePhotos";

interface TrashPhotoCardProps {
  photo: PhotoSummary;
  onPhotoClick: () => void;
  onViewPhoto: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  canPermanentDelete: boolean;
  daysUntilDeletion: number | null;
}

export const TrashPhotoCard = memo(function TrashPhotoCard({
  photo,
  onPhotoClick,
  onViewPhoto,
  onRestore,
  onPermanentDelete,
  canPermanentDelete,
  daysUntilDeletion,
}: TrashPhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefetchDownloadUrl = usePrefetchDownloadUrl();

  const thumbnailUrl = photo.thumbnailUrl || null;

  useEffect(() => {
    if (isHovered && photo.status === "COMPLETED") {
      prefetchDownloadUrl(photo.photoId);
    }
  }, [isHovered, photo.photoId, photo.status, prefetchDownloadUrl]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { getDownloadUrl } = await import("@/lib/api/photos");
      const downloadData = await getDownloadUrl(photo.photoId);
      if (downloadData.url) {
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

  const handleViewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onViewPhoto();
  }, [onViewPhoto]);

  const handleRestore = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRestore();
  }, [onRestore]);

  const handlePermanentDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPermanentDelete();
  }, [onPermanentDelete]);

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPhotoClick}
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
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground">No preview</span>
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

        {/* Deletion warning badge */}
        {daysUntilDeletion !== null && (
          <div className="absolute top-2 left-2">
            <Badge variant={canPermanentDelete ? "destructive" : "secondary"} className="text-xs">
              {canPermanentDelete ? "Can delete" : `${daysUntilDeletion}d left`}
            </Badge>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium truncate" title={photo.filename}>
          {truncate(photo.filename, 30)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(photo.bytes)}</span>
          <span>•</span>
          <span>{formatRelativeTime(photo.createdAt)}</span>
        </div>
        {photo.deletedAt && (
          <p className="text-xs text-muted-foreground">
            Deleted {formatRelativeTime(photo.deletedAt)}
          </p>
        )}
        {daysUntilDeletion !== null && !canPermanentDelete && (
          <p className="text-xs text-orange-500">
            Will be permanently deleted in {daysUntilDeletion} day{daysUntilDeletion !== 1 ? "s" : ""}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleRestore}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Restore
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 text-xs"
            onClick={handlePermanentDelete}
            disabled={!canPermanentDelete}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
});

