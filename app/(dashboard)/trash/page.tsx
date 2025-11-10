"use client";

import { useState, useCallback, useEffect } from "react";
import { TrashPhotoGrid } from "@/components/photos/TrashPhotoGrid";
import { TrashPhotoList } from "@/components/photos/TrashPhotoList";
import { PhotoViewer } from "@/components/photos/PhotoViewer";
import { MetadataPanelWrapper } from "@/components/photos/MetadataPanelWrapper";
import { useUIStore } from "@/stores/uiStore";
import { useTrashPhotos } from "@/hooks/usePhotos";
import { restorePhoto, permanentDeletePhoto } from "@/lib/api/photos";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { isConnectionError } from "@/lib/utils/errors";
import { Button } from "@/components/ui/button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PhotoSummary } from "@/types/domain";

export default function TrashPage() {
  const queryClient = useQueryClient();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [selectedPhotoIdForMetadata, setSelectedPhotoIdForMetadata] = useState<string | null>(null);
  const [metadataPanelOpen, setMetadataPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedPhotos, setLoadedPhotos] = useState<PhotoSummary[]>([]);
  const [restoreDialogPhoto, setRestoreDialogPhoto] = useState<PhotoSummary | null>(null);
  const [deleteDialogPhoto, setDeleteDialogPhoto] = useState<PhotoSummary | null>(null);
  const { viewMode } = useUIStore();

  const { data, isLoading, error } = useTrashPhotos({
    page: currentPage,
    size: 50,
  });

  // Accumulate photos as pages load
  useEffect(() => {
    if (data?.items && data.items.length > 0) {
      setTimeout(() => {
        if (currentPage === 0) {
          setLoadedPhotos(data.items);
        } else {
          setLoadedPhotos((prev) => {
            const existingIds = new Set(prev.map((p) => p.photoId));
            const newItems = data.items.filter((p) => !existingIds.has(p.photoId));
            return [...prev, ...newItems];
          });
        }
      }, 0);
    }
  }, [data?.items, currentPage]);

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (photoId: string) => restorePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trashPhotos"] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast.success("Photo restored");
      setRestoreDialogPhoto(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore photo: ${error.message}`);
    },
  });

  // Permanent delete mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: (photoId: string) => permanentDeletePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trashPhotos"] });
      toast.success("Photo permanently deleted");
      setDeleteDialogPhoto(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete photo: ${error.message}`);
    },
  });

  // Calculate days until permanent deletion
  const getDaysUntilDeletion = useCallback((deletedAt: string | undefined): number | null => {
    if (!deletedAt) return null;
    const deletedDate = new Date(deletedAt).getTime();
    const now = Date.now();
    const daysSinceDeleted = Math.floor((now - deletedDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysSinceDeleted);
  }, []);

  // Check if photo can be permanently deleted (deleted >7 days ago)
  const canPermanentDelete = useCallback((deletedAt: string | undefined): boolean => {
    if (!deletedAt) return false;
    const deletedDate = new Date(deletedAt).getTime();
    const now = Date.now();
    const daysSinceDeleted = Math.floor((now - deletedDate) / (1000 * 60 * 60 * 24));
    return daysSinceDeleted >= 7;
  }, []);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const hasMore = data ? currentPage < data.totalPages - 1 : false;

  // Memoize handlers
  const handlePhotoClick = useCallback((photo: PhotoSummary) => {
    setSelectedPhotoIdForMetadata(photo.photoId);
    setMetadataPanelOpen(true);
  }, []);

  const handleViewPhoto = useCallback((photo: PhotoSummary) => {
    setSelectedPhotoId(photo.photoId);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedPhotoId(null);
  }, []);

  const handleCloseMetadata = useCallback(() => {
    setMetadataPanelOpen(false);
    setSelectedPhotoIdForMetadata(null);
  }, []);

  const handleRestore = useCallback((photo: PhotoSummary) => {
    setRestoreDialogPhoto(photo);
  }, []);

  const handlePermanentDelete = useCallback((photo: PhotoSummary) => {
    if (!canPermanentDelete(photo.deletedAt)) {
      toast.error("Photo can only be permanently deleted 7 days after deletion");
      return;
    }
    setDeleteDialogPhoto(photo);
  }, [canPermanentDelete]);

  // Show loading state
  if (isLoading && currentPage === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Trash</h1>
          <p className="mt-2 text-muted-foreground">Deleted photos will be permanently removed after 7 days</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  // Show connection error
  if (error && isConnectionError(error)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Trash</h1>
          <p className="mt-2 text-muted-foreground">Deleted photos will be permanently removed after 7 days</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center border border-border rounded-lg">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-medium">Cannot connect to server</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please check your connection and try again
          </p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!isLoading && (!data || !data.items || data.items.length === 0) && currentPage === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Trash</h1>
          <p className="mt-2 text-muted-foreground">Deleted photos will be permanently removed after 7 days</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">Trash is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Deleted photos will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Trash</h1>
        <p className="mt-2 text-muted-foreground">Deleted photos will be permanently removed after 7 days</p>
      </div>

      {viewMode === "grid" ? (
        <TrashPhotoGrid
          photos={loadedPhotos}
          onPhotoClick={handlePhotoClick}
          onViewPhoto={handleViewPhoto}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          getDaysUntilDeletion={getDaysUntilDeletion}
          canPermanentDelete={canPermanentDelete}
        />
      ) : (
        <TrashPhotoList
          photos={loadedPhotos}
          onPhotoClick={handlePhotoClick}
          onViewPhoto={handleViewPhoto}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          getDaysUntilDeletion={getDaysUntilDeletion}
          canPermanentDelete={canPermanentDelete}
        />
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      <PhotoViewer
        photoId={selectedPhotoId}
        photos={loadedPhotos}
        open={!!selectedPhotoId}
        onClose={handleCloseViewer}
        onNavigate={setSelectedPhotoId}
      />

      {/* Metadata Panel */}
      <MetadataPanelWrapper
        photoId={selectedPhotoIdForMetadata}
        isOpen={metadataPanelOpen}
        onClose={handleCloseMetadata}
      />

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoreDialogPhoto} onOpenChange={(open) => !open && setRestoreDialogPhoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{restoreDialogPhoto?.filename}"? It will be moved back to My Files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (restoreDialogPhoto) {
                  restoreMutation.mutate(restoreDialogPhoto.photoId);
                }
              }}
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogPhoto} onOpenChange={(open) => !open && setDeleteDialogPhoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{deleteDialogPhoto?.filename}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialogPhoto) {
                  permanentDeleteMutation.mutate(deleteDialogPhoto.photoId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

