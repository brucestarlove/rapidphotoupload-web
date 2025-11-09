"use client";

import { useState } from "react";
import Image from "next/image";
import type { PhotoSummary } from "@/types/domain";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatRelativeTime, truncate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Eye, Download } from "lucide-react";

interface PhotoCardProps {
  photo: PhotoSummary;
  onClick: () => void;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate thumbnail URL (placeholder - will use presigned URL in Phase 2)
  const thumbnailUrl = photo.photoId
    ? `/api/photos/${photo.photoId}/thumbnail`
    : "/placeholder-image.jpg";

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="aspect-square relative bg-muted">
        {!imageError ? (
          <Image
            src={thumbnailUrl}
            alt={photo.filename}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
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

