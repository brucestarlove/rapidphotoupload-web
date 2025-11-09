"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { usePhoto } from "@/hooks/usePhotos";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFileSize, formatDate } from "@/lib/utils/format";

interface PhotoViewerProps {
  photoId: string | null;
  open: boolean;
  onClose: () => void;
}

export function PhotoViewer({ photoId, open, onClose }: PhotoViewerProps) {
  const { data: photo, isLoading } = usePhoto(photoId || null);

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

  // Use presigned URL from API response, prefer 1024px thumbnail or full image URL
  const imageUrl = photo?.fullImageUrl || photo?.thumbnailUrl1024 || photo?.thumbnailUrl || null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl p-0">
        <div className="flex h-[90vh] flex-col">
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
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Image */}
          <div className="relative flex-1 overflow-auto bg-muted p-4">
            {isLoading ? (
              <Skeleton className="mx-auto h-full max-h-[calc(90vh-8rem)] w-full max-w-5xl" />
            ) : imageUrl ? (
              <div className="flex h-full items-center justify-center">
                <Image
                  src={imageUrl}
                  alt={photo?.filename || "Photo"}
                  width={photo?.width || 1920}
                  height={photo?.height || 1080}
                  className="max-h-[calc(90vh-8rem)] w-auto object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

