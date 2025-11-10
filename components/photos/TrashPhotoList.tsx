"use client";

import { useMemo, useCallback } from "react";
import Image from "next/image";
import { useUIStore, type SortField } from "@/stores/uiStore";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/format";
import { JobStatusBadge } from "@/components/progress/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Download, RotateCcw, Trash2 } from "lucide-react";
import type { PhotoSummary } from "@/types/domain";

interface TrashPhotoListProps {
  photos: PhotoSummary[];
  onPhotoClick: (photo: PhotoSummary) => void;
  onViewPhoto: (photo: PhotoSummary) => void;
  onRestore: (photo: PhotoSummary) => void;
  onPermanentDelete: (photo: PhotoSummary) => void;
  getDaysUntilDeletion: (deletedAt: string | undefined) => number | null;
  canPermanentDelete: (deletedAt: string | undefined) => boolean;
}

export function TrashPhotoList({
  photos,
  onPhotoClick,
  onViewPhoto,
  onRestore,
  onPermanentDelete,
  getDaysUntilDeletion,
  canPermanentDelete,
}: TrashPhotoListProps) {
  const { sortConfig, toggleSort } = useUIStore();

  const handleDownload = useCallback(async (e: React.MouseEvent, photo: PhotoSummary) => {
    e.stopPropagation();
    try {
      const { getDownloadUrl } = await import("@/lib/api/photos");
      const downloadData = await getDownloadUrl(photo.photoId);
      if (downloadData.url) {
        const link = document.createElement("a");
        link.href = downloadData.url;
        link.download = photo.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Failed to download photo:", error);
    }
  }, []);

  const handleViewClick = useCallback((e: React.MouseEvent, photo: PhotoSummary) => {
    e.stopPropagation();
    onViewPhoto(photo);
  }, [onViewPhoto]);

  const handleRestore = useCallback((e: React.MouseEvent, photo: PhotoSummary) => {
    e.stopPropagation();
    onRestore(photo);
  }, [onRestore]);

  const handlePermanentDelete = useCallback((e: React.MouseEvent, photo: PhotoSummary) => {
    e.stopPropagation();
    onPermanentDelete(photo);
  }, [onPermanentDelete]);

  // Sort photos based on sortConfig
  const sortedPhotos = useMemo(() => {
    const sorted = [...photos];
    const { field, direction } = sortConfig;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case "name":
          comparison = a.filename.localeCompare(b.filename);
          break;
        case "date":
          // Sort by deletedAt if available, otherwise createdAt
          const aDate = a.deletedAt ? new Date(a.deletedAt).getTime() : new Date(a.createdAt).getTime();
          const bDate = b.deletedAt ? new Date(b.deletedAt).getTime() : new Date(b.createdAt).getTime();
          comparison = aDate - bDate;
          break;
        case "size":
          comparison = a.bytes - b.bytes;
          break;
      }

      return direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [photos, sortConfig]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("date")}
              >
                <div className="flex items-center">
                  Deleted
                  <SortIcon field="date" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("size")}
              >
                <div className="flex items-center">
                  Size
                  <SortIcon field="size" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPhotos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No photos found
                </td>
              </tr>
            ) : (
              sortedPhotos.map((photo) => {
                const daysUntil = getDaysUntilDeletion(photo.deletedAt);
                const canDelete = canPermanentDelete(photo.deletedAt);
                return (
                  <tr
                    key={photo.photoId}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onPhotoClick(photo)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleViewClick(e, photo)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleDownload(e, photo)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="relative h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-muted">
                          {photo.thumbnailUrl ? (
                            <Image
                              src={photo.thumbnailUrl}
                              alt={photo.filename}
                              fill
                              className="object-cover"
                              unoptimized
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              {photo.filename.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium truncate max-w-xs" title={photo.filename}>
                            {photo.filename}
                          </span>
                          {daysUntil !== null && !canDelete && (
                            <span className="text-xs text-orange-500">
                              {daysUntil} day{daysUntil !== 1 ? "s" : ""} until permanent deletion
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {photo.deletedAt ? formatRelativeTime(photo.deletedAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatFileSize(photo.bytes)}
                    </td>
                    <td className="px-4 py-3">
                      <JobStatusBadge status={photo.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => handleRestore(e, photo)}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => handlePermanentDelete(e, photo)}
                          disabled={!canDelete}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

