import { useCallback, useRef } from "react";
import { useUploadStore } from "@/stores/uploadStore";
import { createUploadJob, updateProgress, finalizeMultipartUpload } from "@/lib/api/upload";
import { uploadToS3, uploadMultipartToS3 } from "@/lib/s3/multipart";
import { toast } from "sonner";
import type { ProgressUpdate, JobStatusUpdate, CreateUploadJobResponseItem } from "@/types/api";

const MULTIPART_THRESHOLD = 5 * 1024 * 1024; // 5MB - files larger than this use multipart
const PROGRESS_THROTTLE_MS = 16; // ~60fps

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Allowed image file extensions (case-insensitive)
const ALLOWED_EXTENSIONS: readonly string[] = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/**
 * Check if a file is an allowed image type
 */
function isValidImageType(file: File): boolean {
  // Check MIME type first
  const mimeType = file.type.toLowerCase();
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return true;
  }

  // Fallback: check file extension (MIME types can be unreliable)
  const fileName = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

// Throttle progress updates to ~60fps
function throttleProgress(
  callback: (progress: number) => void,
  delay: number = PROGRESS_THROTTLE_MS
) {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (progress: number) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= delay) {
      lastCall = now;
      callback(progress);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else {
      // Schedule update for remaining time
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          callback(progress);
          timeoutId = null;
        }, delay - timeSinceLastCall);
      }
    }
  };
}

export function useUpload() {
  const {
    addUpload,
    updateUpload,
    updateFileProgress,
    updateFileStatus,
    addJob,
    concurrencyLimit,
    isPaused,
  } = useUploadStore();
  
  const activeUploadCountRef = useRef(0);

  // Handle WebSocket progress updates
  const handleProgressUpdate = useCallback((update: ProgressUpdate) => {
    if (update.photoId) {
      updateFileProgress(update.photoId, update.progressPercent);
      updateFileStatus(update.photoId, update.status as any);
    }
  }, [updateFileProgress, updateFileStatus]);

  const handleJobStatusUpdate = useCallback((_update: JobStatusUpdate) => {
    // Job-level updates can be used for batch summary
    // Individual file updates come via ProgressUpdate
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      try {
        // Validate files
        const validFiles = files.filter((file) => {
          if (!isValidImageType(file)) {
            toast.error(
              `File ${file.name} is not a supported image type. Allowed types: JPG, JPEG, PNG, GIF, WEBP`
            );
            return false;
          }
          return true;
        });

        if (validFiles.length === 0) return;

        // Determine strategy per file (multipart for files > 5MB)
        const fileMetadata = validFiles.map((file) => ({
          filename: file.name,
          mimeType: file.type,
          bytes: file.size,
        }));

        // Create upload job
        const jobData = {
          files: fileMetadata,
          strategy: "s3-presigned" as const,
        };

        const jobResponse = await createUploadJob(jobData);
        const { jobId, items } = jobResponse;

        // Track job in store
        const photoIds = items.map((item) => item.photoId);
        addJob(jobId, photoIds);

        // Add files to upload store
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          const item = items[i];
          addUpload(item.photoId, file, jobId);
        }

        // Subscribe to WebSocket for real-time updates
        // Note: WebSocket subscription is handled by the component using useWebSocket hook

        // Upload files with concurrency control
        const uploadPromises = items.map((item, index) => {
          const file = validFiles[index];
          return () => uploadSingleFile(file, item, jobId);
        });

        // Process uploads with concurrency limit
        await processUploadsWithConcurrency(uploadPromises, concurrencyLimit);

        // Show completion toast
        toast.success(`Uploaded ${validFiles.length} file${validFiles.length > 1 ? "s" : ""}`);
      } catch (error) {
        toast.error("Failed to create upload job");
        console.error("Upload error:", error);
      }
    },
    [addUpload, addJob, concurrencyLimit]
  );

  // Upload a single file (single PUT or multipart)
  const uploadSingleFile = async (
    file: File,
    item: CreateUploadJobResponseItem,
    _jobId: string
  ) => {
    // Wait if paused
    while (isPaused) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Wait for available slot
    while (activeUploadCountRef.current >= concurrencyLimit) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    activeUploadCountRef.current++;
    updateFileStatus(item.photoId, "UPLOADING");
    
    // Check if upload was cancelled before starting
    const upload = useUploadStore.getState().uploads.get(item.photoId);
    if (upload?.status === "CANCELLED") {
      activeUploadCountRef.current--;
      return;
    }

    try {
      // Throttled progress callback
      const throttledProgress = throttleProgress((progress) => {
        updateFileProgress(item.photoId, progress);
        // Update progress on backend (best-effort)
        updateProgress({
          photoId: item.photoId,
          bytesSent: Math.floor((file.size * progress) / 100),
          bytesTotal: file.size,
        });
      });

      if (item.multipart && file.size > MULTIPART_THRESHOLD) {
        // Multipart upload
        const { uploadId, partSize, partUrls } = item.multipart;
        
        // Upload all parts
        const parts = await uploadMultipartToS3(file, partUrls, partSize, throttledProgress);
        
        // Finalize multipart upload
        await finalizeMultipartUpload(item.photoId, {
          uploadId,
          parts: parts.map((p) => ({ partNumber: p.partNumber, etag: p.etag })),
        });
        
        updateFileProgress(item.photoId, 100);
        updateFileStatus(item.photoId, "PROCESSING"); // Backend will update to COMPLETED via WebSocket
      } else {
        // Single PUT upload
        await uploadToS3(file, item.presignedUrl, throttledProgress);
        updateFileProgress(item.photoId, 100);
        updateFileStatus(item.photoId, "PROCESSING"); // Backend will update to COMPLETED via WebSocket
      }
    } catch (error) {
      updateFileStatus(item.photoId, "FAILED");
      updateUpload(item.photoId, {
        error: error instanceof Error ? error.message : "Upload failed",
      });
      throw error;
    } finally {
      activeUploadCountRef.current--;
    }
  };

  // Process uploads with concurrency limit
  const processUploadsWithConcurrency = async (
    uploadFunctions: Array<() => Promise<void>>,
    limit: number
  ) => {
    const executing: Promise<void>[] = [];
    
    for (const uploadFn of uploadFunctions) {
      // Wait if we've reached the limit
      if (executing.length >= limit) {
        // Wait for at least one to complete
        await Promise.race(executing);
        // Filter out completed promises (they're removed by finally handlers)
        // We'll just wait a tick to let finally handlers run
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      
      // Start new upload
      const promise = uploadFn().catch((error) => {
        console.error("Upload failed:", error);
      });
      
      // Track promise completion
      promise.finally(() => {
        const index = executing.indexOf(promise);
        if (index > -1) {
          executing.splice(index, 1);
        }
      });
      
      executing.push(promise);
    }
    
    // Wait for all remaining uploads
    await Promise.allSettled(executing);
  };

  return {
    uploadFiles,
    handleProgressUpdate,
    handleJobStatusUpdate,
  };
}

