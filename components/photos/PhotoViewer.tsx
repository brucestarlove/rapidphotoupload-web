"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { usePhoto, useDownloadUrl } from "@/hooks/usePhotos";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFileSize, formatDate } from "@/lib/utils/format";
import { PhotoMetadata } from "./PhotoMetadata";
import type { PhotoSummary } from "@/types/domain";

interface PhotoViewerProps {
  photoId: string | null;
  photos: PhotoSummary[];
  open: boolean;
  onClose: () => void;
  onNavigate?: (photoId: string) => void;
}

export function PhotoViewer({ photoId, photos, open, onClose, onNavigate }: PhotoViewerProps) {
  const [metadataOpen, setMetadataOpen] = useState(false);
  const { data: photo, isLoading } = usePhoto(photoId || null);
  // Fetch download URL for both download button and as fallback for display
  const { data: downloadData, isLoading: isLoadingDownloadUrl } = useDownloadUrl(
    open && photoId ? photoId : null
  );

  // Reset metadata panel when photo changes
  useEffect(() => {
    if (photoId && metadataOpen) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setMetadataOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [photoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Use view URLs from photo metadata first, then fall back to download URL
  // Priority: fullImageUrl > thumbnailUrl1024 > thumbnailUrl > downloadUrl
  // Note: downloadUrl has attachment disposition but will still display the image
  const imageUrl = 
    photo?.fullImageUrl || 
    photo?.thumbnailUrl1024 || 
    photo?.thumbnailUrl || 
    downloadData?.url || 
    null;

  // Memoize download handler to prevent unnecessary re-renders
  const handleDownload = useCallback(() => {
    if (!downloadData?.url) return;
    // Create a temporary link to trigger download
    const link = document.createElement("a");
    link.href = downloadData.url;
    link.download = photo?.filename || "photo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadData, photo?.filename]);

  // Find current photo index and navigation helpers
  const { currentIndex, canGoPrevious, canGoNext, previousPhotoId, nextPhotoId } = useMemo(() => {
    if (!photoId || photos.length === 0) {
      return {
        currentIndex: -1,
        canGoPrevious: false,
        canGoNext: false,
        previousPhotoId: null,
        nextPhotoId: null,
      };
    }

    const index = photos.findIndex((p) => p.photoId === photoId);
    return {
      currentIndex: index,
      canGoPrevious: index > 0,
      canGoNext: index < photos.length - 1,
      previousPhotoId: index > 0 ? photos[index - 1].photoId : null,
      nextPhotoId: index < photos.length - 1 ? photos[index + 1].photoId : null,
    };
  }, [photoId, photos]);

  const handlePrevious = useCallback(() => {
    if (previousPhotoId) {
      onNavigate?.(previousPhotoId);
    }
  }, [previousPhotoId, onNavigate]);

  const handleNext = useCallback(() => {
    if (nextPhotoId) {
      onNavigate?.(nextPhotoId);
    }
  }, [nextPhotoId, onNavigate]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && canGoPrevious && previousPhotoId) {
        e.preventDefault();
        onNavigate?.(previousPhotoId);
      } else if (e.key === "ArrowRight" && canGoNext && nextPhotoId) {
        e.preventDefault();
        onNavigate?.(nextPhotoId);
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleDownload();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, canGoPrevious, canGoNext, previousPhotoId, nextPhotoId, onNavigate, onClose, handleDownload]);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl p-0" showCloseButton={false}>
          <div className="flex max-h-[90vh] flex-col">
          {/* Header */}
          <DialogHeader className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle>{photo?.filename || "Photo"}</DialogTitle>
                <DialogDescription>
                  {photo && (
                    <>
                      {formatFileSize(photo.bytes)} • {formatDate(photo.createdAt)}
                      {photos.length > 0 && currentIndex >= 0 && (
                        <> • Photo {currentIndex + 1} of {photos.length}</>
                      )}
                    </>
                  )}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleDownload} title="Download (D)">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} title="Close (Esc)">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Image with Navigation */}
          <div className="relative overflow-auto bg-muted p-4">
            {/* Previous Button */}
            {canGoPrevious && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                onClick={handlePrevious}
                title="Previous (←)"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* Next Button */}
            {canGoNext && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                onClick={handleNext}
                title="Next (→)"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
            {isLoading || isLoadingDownloadUrl ? (
              <Skeleton className="mx-auto h-96 w-full max-w-5xl" />
            ) : imageUrl ? (
              <div className="flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={photo?.filename || "Photo"}
                  width={photo?.width || 1920}
                  height={photo?.height || 1080}
                  className="max-h-[calc(90vh-12rem)] w-auto object-contain"
                  unoptimized
                  priority // Load eagerly since it's in a modal/viewer
                />
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    {open && (
      <PhotoMetadata
        photo={photo || null}
        isOpen={metadataOpen}
        onToggle={() => setMetadataOpen(!metadataOpen)}
      />
    )}
    </>
  );
}

