"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { usePhoto, useDownloadUrl } from "@/hooks/usePhotos";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFileSize, formatDate } from "@/lib/utils/format";

interface PhotoViewerProps {
  photoId: string | null;
  open: boolean;
  onClose: () => void;
}

export function PhotoViewer({ photoId, open, onClose }: PhotoViewerProps) {
  const { data: photo, isLoading } = usePhoto(photoId || null);
  // Fetch download URL for both download button and as fallback for display
  const { data: downloadData, isLoading: isLoadingDownloadUrl } = useDownloadUrl(
    open && photoId ? photoId : null
  );

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose]);

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl p-0" showCloseButton={false}>
        <div className="flex max-h-[90vh] flex-col">
          {/* Header */}
          <DialogHeader className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{photo?.filename || "Photo"}</DialogTitle>
                <DialogDescription>
                  {photo && (
                    <>
                      {formatFileSize(photo.bytes)} • {formatDate(photo.createdAt)}
                    </>
                  )}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Image */}
          <div className="relative overflow-auto bg-muted p-4">
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
  );
}

