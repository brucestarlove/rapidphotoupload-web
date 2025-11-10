"use client";

import { TrashPhotoCard } from "./TrashPhotoCard";
import type { PhotoSummary } from "@/types/domain";

interface TrashPhotoGridProps {
  photos: PhotoSummary[];
  onPhotoClick: (photo: PhotoSummary) => void;
  onViewPhoto: (photo: PhotoSummary) => void;
  onRestore: (photo: PhotoSummary) => void;
  onPermanentDelete: (photo: PhotoSummary) => void;
  getDaysUntilDeletion: (deletedAt: string | undefined) => number | null;
  canPermanentDelete: (deletedAt: string | undefined) => boolean;
}

export function TrashPhotoGrid({
  photos,
  onPhotoClick,
  onViewPhoto,
  onRestore,
  onPermanentDelete,
  getDaysUntilDeletion,
  canPermanentDelete,
}: TrashPhotoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {photos.map((photo) => (
        <TrashPhotoCard
          key={photo.photoId}
          photo={photo}
          onPhotoClick={() => onPhotoClick(photo)}
          onViewPhoto={() => onViewPhoto(photo)}
          onRestore={() => onRestore(photo)}
          onPermanentDelete={() => onPermanentDelete(photo)}
          canPermanentDelete={canPermanentDelete(photo.deletedAt)}
          daysUntilDeletion={getDaysUntilDeletion(photo.deletedAt)}
        />
      ))}
    </div>
  );
}

