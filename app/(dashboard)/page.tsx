"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { PhotoList } from "@/components/photos/PhotoList";
import { PhotoViewer } from "@/components/photos/PhotoViewer";
import { MetadataPanelWrapper } from "@/components/photos/MetadataPanelWrapper";
import { StatusFilter } from "@/components/filters/StatusFilter";
import { TagFilter } from "@/components/filters/TagFilter";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { useUIStore } from "@/stores/uiStore";
import { usePhotos } from "@/hooks/usePhotos";
import { UploadZone } from "@/components/upload/UploadZone";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Filter, X } from "lucide-react";
import { isConnectionError } from "@/lib/utils/errors";
import { Button } from "@/components/ui/button";
import { isAfter, isBefore, parseISO, isEqual, isWithinInterval } from "date-fns";
import type { PhotoSummary } from "@/types/domain";

export default function DashboardPage() {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [selectedPhotoIdForMetadata, setSelectedPhotoIdForMetadata] = useState<string | null>(null);
  const [metadataPanelOpen, setMetadataPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedPhotos, setLoadedPhotos] = useState<PhotoSummary[]>([]);
  const {
    viewMode,
    filters,
    setStatusFilter,
    setTagFilter,
    setDateRangeFilter,
    clearFilters,
  } = useUIStore();

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({
    status: filters.status,
    search: filters.search,
    firstTag: filters.tags?.[0],
  });

  // Build API params from filters
  const apiParams = useMemo(() => {
    const params: {
      page?: number;
      size?: number;
      tag?: string;
      status?: string;
      search?: string;
    } = {
      page: currentPage,
      size: 50, // Load 50 photos per page
    };

    if (filters.status && filters.status !== "ALL") {
      params.status = filters.status;
    }
    if (filters.search) {
      params.search = filters.search;
    }
    // Note: Backend may support multiple tags, but for now we'll use the first tag
    if (filters.tags && filters.tags.length > 0) {
      params.tag = filters.tags[0];
    }

    return params;
  }, [filters, currentPage]);

  const { data, isLoading, error } = usePhotos(apiParams);

  // Reset loaded photos when filters change
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const firstTag = filters.tags?.[0];
    const hasFilterChanged =
      prev.status !== filters.status ||
      prev.search !== filters.search ||
      prev.firstTag !== firstTag;

    if (hasFilterChanged) {
      // Update ref first
      prevFiltersRef.current = {
        status: filters.status,
        search: filters.search,
        firstTag,
      };
      // Defer state updates to avoid synchronous setState in effect
      setTimeout(() => {
        setCurrentPage(0);
        setLoadedPhotos([]);
      }, 0);
    }
  }, [filters.status, filters.search, filters.tags]);

  // Accumulate photos as pages load
  useEffect(() => {
    if (data?.items && data.items.length > 0) {
      // Defer state updates to avoid synchronous setState in effect
      setTimeout(() => {
        if (currentPage === 0) {
          // First page - replace
          setLoadedPhotos(data.items);
        } else {
          // Subsequent pages - append (avoid duplicates)
          setLoadedPhotos((prev) => {
            const existingIds = new Set(prev.map((p) => p.photoId));
            const newItems = data.items.filter((p) => !existingIds.has(p.photoId));
            return [...prev, ...newItems];
          });
        }
      }, 0);
    }
  }, [data?.items, currentPage]);

  // Apply client-side filters (date range, multiple tags)
  const filteredPhotos = useMemo(() => {
    if (!loadedPhotos || loadedPhotos.length === 0) return [];

    let result = [...loadedPhotos];

    // Filter by date range (client-side)
    if (filters.dateRange) {
      const startDate = parseISO(filters.dateRange.start);
      const endDate = parseISO(filters.dateRange.end);
      result = result.filter((photo) => {
        const photoDate = parseISO(photo.createdAt);
        // Use isWithinInterval for inclusive range check (includes both start and end dates)
        return isWithinInterval(photoDate, { start: startDate, end: endDate });
      });
    }

    // Filter by multiple tags (client-side, if backend doesn't support it)
    if (filters.tags && filters.tags.length > 0) {
      // If backend already filtered by first tag, filter remaining tags client-side
      const remainingTags = filters.tags.slice(1);
      if (remainingTags.length > 0) {
        result = result.filter((photo) => {
          const photoTags = photo.tags || [];
          return remainingTags.every((tag) => photoTags.includes(tag));
        });
      }
    }

    return result;
  }, [loadedPhotos, filters.dateRange, filters.tags]);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const hasMore = data ? currentPage < data.totalPages - 1 : false;

  // Check if any filters are active
  const hasActiveFilters =
    (filters.status && filters.status !== "ALL") ||
    (filters.tags && filters.tags.length > 0) ||
    filters.dateRange ||
    filters.search;

  // Memoize handlers to prevent unnecessary re-renders of child components
  const handlePhotoClick = useCallback((photo: PhotoSummary) => {
    // Clicking photo opens metadata panel
    setSelectedPhotoIdForMetadata(photo.photoId);
    setMetadataPanelOpen(true);
  }, []);

  const handleViewPhoto = useCallback((photo: PhotoSummary) => {
    // Eye button opens photo viewer
    setSelectedPhotoId(photo.photoId);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedPhotoId(null);
  }, []);

  const handleCloseMetadata = useCallback(() => {
    setMetadataPanelOpen(false);
    setSelectedPhotoIdForMetadata(null);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">My Files</h1>
          <p className="mt-2 text-muted-foreground">Manage and view your photos</p>
        </div>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <div className="p-4 space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show connection error
  if (error && isConnectionError(error)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">My Files</h1>
          <p className="mt-2 text-muted-foreground">Manage and view your photos</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            Cannot connect to server
          </h3>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            Unable to connect to the backend server. Please check that the server is running
            and that the API URL is configured correctly.
          </p>
          <p className="text-xs text-muted-foreground">
            Check your <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_API_URL</code> environment variable
          </p>
        </div>
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">My Files</h1>
          <p className="mt-2 text-muted-foreground">Manage and view your photos</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive">Failed to load photos</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  // Show empty state
  const hasNoPhotos = !isLoading && (!data || !data.items || data.items.length === 0) && currentPage === 0;
  const hasNoFilteredResults = !hasNoPhotos && !isLoading && filteredPhotos.length === 0 && hasActiveFilters;

  if (hasNoPhotos) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">My Files</h1>
          <p className="mt-2 text-muted-foreground">Manage and view your photos</p>
        </div>
        <div className="space-y-6">
          <UploadZone />
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">No photos yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your first photo to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasNoFilteredResults) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">My Files</h1>
          <p className="mt-2 text-muted-foreground">Manage and view your photos</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <StatusFilter
            value={filters.status || "ALL"}
            onChange={setStatusFilter}
          />
          <TagFilter
            selectedTags={filters.tags || []}
            onTagsChange={setTagFilter}
          />
          <DateRangeFilter
            value={filters.dateRange}
            onChange={setDateRangeFilter}
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">No photos match your filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or{" "}
            <button
              onClick={clearFilters}
              className="text-primary hover:underline"
            >
              clear all filters
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">My Files</h1>
          <p className="mt-2 text-muted-foreground">Manage and view your photos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 border border-border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <StatusFilter
          value={filters.status || "ALL"}
          onChange={setStatusFilter}
        />
        <TagFilter
          selectedTags={filters.tags || []}
          onTagsChange={setTagFilter}
        />
        <DateRangeFilter
          value={filters.dateRange}
          onChange={setDateRangeFilter}
        />
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Results count */}
      {hasActiveFilters && filteredPhotos.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredPhotos.length} of {data?.totalElements || 0} photos
        </p>
      )}

      {viewMode === "grid" ? (
        <PhotoGrid 
          photos={filteredPhotos} 
          onPhotoClick={handlePhotoClick}
          onViewPhoto={handleViewPhoto}
        />
      ) : (
        <PhotoList 
          photos={filteredPhotos} 
          onPhotoClick={handlePhotoClick}
          onViewPhoto={handleViewPhoto}
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
        photos={filteredPhotos}
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
    </div>
  );
}

