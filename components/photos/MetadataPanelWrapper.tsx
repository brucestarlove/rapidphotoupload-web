"use client";

import { PhotoMetadata } from "./PhotoMetadata";
import { usePhoto } from "@/hooks/usePhotos";

interface MetadataPanelWrapperProps {
  photoId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function MetadataPanelWrapper({ photoId, isOpen, onClose }: MetadataPanelWrapperProps) {
  const { data: photo } = usePhoto(photoId || null);

  if (!photoId) return null;

  return (
    <PhotoMetadata
      photo={photo || null}
      isOpen={isOpen}
      onToggle={onClose}
    />
  );
}

export { MetadataPanelWrapper };

