"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { JobStatusBadge } from "@/components/progress/JobStatusBadge";
import { TagList } from "./TagList";
import { TagInput } from "./TagInput";
import { formatFileSize, formatDate } from "@/lib/utils/format";
import { ChevronRight, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExifData } from "./ExifData";
import { addTag, removeTag, getTags } from "@/lib/api/tags";
import { deletePhoto } from "@/lib/api/photos";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
import type { PhotoMetadataResponse } from "@/types/api";

interface PhotoMetadataProps {
  photo: PhotoMetadataResponse | null;
  isOpen: boolean;
  onToggle: () => void;
}

export function PhotoMetadata({ photo, isOpen, onToggle }: PhotoMetadataProps) {
  const queryClient = useQueryClient();
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch available tags for autocomplete
  const { data: availableTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
    enabled: isOpen && isEditingTags,
  });

  // Add tag mutation
  const addTagMutation = useMutation({
    mutationFn: ({ photoId, tag }: { photoId: string; tag: string }) =>
      addTag(photoId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo", photo?.photoId] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast.success("Tag added");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add tag: ${error.message}`);
    },
  });

  // Remove tag mutation
  const removeTagMutation = useMutation({
    mutationFn: ({ photoId, tag }: { photoId: string; tag: string }) =>
      removeTag(photoId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo", photo?.photoId] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast.success("Tag removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove tag: ${error.message}`);
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => deletePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo", photo?.photoId] });
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      queryClient.invalidateQueries({ queryKey: ["trashPhotos"] });
      toast.success("Photo moved to Trash");
      setShowDeleteDialog(false);
      onToggle(); // Close metadata panel
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete photo: ${error.message}`);
    },
  });

  const handleAddTag = useCallback(
    (tag: string) => {
      if (!photo) return;
      addTagMutation.mutate({ photoId: photo.photoId, tag });
    },
    [photo, addTagMutation]
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      if (!photo) return;
      removeTagMutation.mutate({ photoId: photo.photoId, tag });
    },
    [photo, removeTagMutation]
  );

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      if (!photo) return;
      
      // Find added and removed tags
      const currentTags = photo.tags || [];
      const added = tags.filter((tag) => !currentTags.includes(tag));
      const removed = currentTags.filter((tag) => !tags.includes(tag));

      // Add new tags
      added.forEach((tag) => handleAddTag(tag));
      
      // Remove deleted tags
      removed.forEach((tag) => handleRemoveTag(tag));
    },
    [photo, handleAddTag, handleRemoveTag]
  );

  if (!photo) return null;

  return (
    <>
      {/* Toggle Button - only show when metadata panel is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 rounded-l-lg rounded-r-none bg-card border border-border border-r-0 shadow-lg"
          title="Show metadata"
        >
          <Info className="h-4 w-4" />
        </Button>
      )}

      {/* Slide-out Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg z-[60] transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Metadata</h2>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Filename
              </label>
              <p className="mt-1 text-sm break-all">{photo.filename}</p>
            </div>

            {photo.width && photo.height && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Dimensions
                </label>
                <p className="mt-1 text-sm">
                  {photo.width} × {photo.height} pixels
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                File Size
              </label>
              <p className="mt-1 text-sm">{formatFileSize(photo.bytes)}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Created
              </label>
              <p className="mt-1 text-sm">{formatDate(photo.createdAt)}</p>
            </div>

            {photo.completedAt && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Completed
                </label>
                <p className="mt-1 text-sm">{formatDate(photo.completedAt)}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <div className="mt-1">
                <JobStatusBadge status={photo.status as any} />
              </div>
            </div>

            {photo.s3Key && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  S3 Key
                </label>
                <p className="mt-1 text-xs font-mono break-all text-muted-foreground">
                  {photo.s3Key}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tags
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setIsEditingTags(!isEditingTags)}
              >
                {isEditingTags ? "Done" : "Edit"}
              </Button>
            </div>
            {isEditingTags ? (
              <TagInput
                value={photo.tags || []}
                onChange={handleTagsChange}
                suggestions={availableTags}
                disabled={addTagMutation.isPending || removeTagMutation.isPending}
              />
            ) : (
              <TagList
                tags={photo.tags || []}
                editable={false}
              />
            )}
          </div>

          {/* EXIF Data */}
          <ExifData photo={photo} />

          <Separator />

          {/* Delete Button */}
          <div className="pt-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deletePhotoMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              This photo will be moved to Trash and permanently deleted in 7 days. You can restore it from Trash before then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (photo) {
                  deletePhotoMutation.mutate(photo.photoId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[55]"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
}

