"use client";

import { PhotoCard } from "./PhotoCard";
import { UploadZone } from "@/components/upload/UploadZone";
import type { PhotoSummary } from "@/types/domain";

interface PhotoGridProps {
  photos: PhotoSummary[];
  onPhotoClick: (photo: PhotoSummary) => void;
  onViewPhoto: (photo: PhotoSummary) => void;
}

export function PhotoGrid({ photos, onPhotoClick, onViewPhoto }: PhotoGridProps) {
  return (
    <div className="space-y-6">
      <UploadZone />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {photos.map((photo) => (
          <PhotoCard 
            key={photo.photoId} 
            photo={photo} 
            onPhotoClick={() => onPhotoClick(photo)}
            onViewPhoto={() => onViewPhoto(photo)}
          />
        ))}
      </div>
    </div>
  );
}
