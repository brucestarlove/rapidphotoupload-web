"use client";

import { useState } from "react";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { PhotoViewer } from "@/components/photos/PhotoViewer";
import type { PhotoSummary } from "@/types/domain";

export default function DashboardPage() {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const handlePhotoClick = (photo: PhotoSummary) => {
    setSelectedPhotoId(photo.photoId);
  };

  const handleCloseViewer = () => {
    setSelectedPhotoId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Files</h1>
        <p className="mt-2 text-muted-foreground">Manage and view your photos</p>
      </div>

      <PhotoGrid onPhotoClick={handlePhotoClick} />

      <PhotoViewer photoId={selectedPhotoId} open={!!selectedPhotoId} onClose={handleCloseViewer} />
    </div>
  );
}

