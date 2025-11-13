"use client";

import { useEffect, useCallback, useRef } from "react";
import { useUploadStore } from "@/stores/uploadStore";
import { useQueryClient } from "@tanstack/react-query";
import { getJobStatus } from "@/lib/api/upload";
import type { JobStatusResponse } from "@/types/api";

/**
 * Polling interval in milliseconds (1.5 seconds)
 */
const POLL_INTERVAL = 1500;

/**
 * Terminal job states that indicate polling should stop
 */
const TERMINAL_STATES = ["COMPLETED", "FAILED", "CANCELLED"] as const;

/**
 * Hook to manage polling for all active upload jobs
 * Replaces WebSocket-based approach with polling
 */
export function useUploadWebSocket() {
  const { jobs, updateFileProgress, updateFileStatus } = useUploadStore();
  const queryClient = useQueryClient();
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Update upload store with job status response
   */
  const handleJobStatusUpdate = useCallback(
    (jobStatus: JobStatusResponse) => {
      console.log("[useUploadWebSocket] Polled job status:", jobStatus.jobId, jobStatus.status);

      // Update each photo's status and progress from the response
      jobStatus.photos.forEach((photo) => {
        // Map backend status to our PhotoStatus type
        // The backend returns statuses like "COMPLETED", "FAILED", etc.
        const status = photo.status as any;

        // Update file status
        updateFileStatus(photo.photoId, status);

        // If photo is completed, set progress to 100%
        if (photo.status === "COMPLETED") {
          updateFileProgress(photo.photoId, 100);
        } else if (photo.status === "FAILED") {
          // Keep current progress, but mark as failed
          // Progress might already be set from upload progress
        }
        // For other statuses (QUEUED, IN_PROGRESS, PROCESSING), progress is updated
        // separately during the actual upload process
      });

      // When job completes (with or without errors), refresh the photos list
      if (TERMINAL_STATES.includes(jobStatus.status as any)) {
        console.log("[useUploadWebSocket] Job reached terminal state:", jobStatus.status);

        // Update any photos that are still in PROCESSING/UPLOADING status to COMPLETED
        // (Failed photos should already be marked as FAILED from the photos array)
        const { getJobPhotoIds, uploads } = useUploadStore.getState();
        const photoIds = getJobPhotoIds(jobStatus.jobId);

        photoIds.forEach((photoId) => {
          const upload = uploads.get(photoId);
          // Only update if still processing (not already failed or cancelled)
          if (
            upload &&
            (upload.status === "PROCESSING" || upload.status === "UPLOADING")
          ) {
            // Check if this photo is in the completed photos list
            const photoStatus = jobStatus.photos.find((p) => p.photoId === photoId);
            if (photoStatus && photoStatus.status === "COMPLETED") {
              console.log("[useUploadWebSocket] Updating photo:", photoId, "to COMPLETED");
              updateFileProgress(photoId, 100);
              updateFileStatus(photoId, "COMPLETED");
            }
          }
        });

        // Invalidate photos query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["photos"] });
      }
    },
    [updateFileProgress, updateFileStatus, queryClient]
  );

  /**
   * Poll a single job for status updates
   */
  const pollJob = useCallback(
    async (jobId: string) => {
      try {
        const jobStatus = await getJobStatus(jobId);
        handleJobStatusUpdate(jobStatus);

        // Stop polling if job reached terminal state
        if (TERMINAL_STATES.includes(jobStatus.status as any)) {
          const interval = intervalsRef.current.get(jobId);
          if (interval) {
            clearInterval(interval);
            intervalsRef.current.delete(jobId);
            console.log("[useUploadWebSocket] Stopped polling job:", jobId);
          }
        }
      } catch (error) {
        console.error("[useUploadWebSocket] Polling error for job", jobId, ":", error);
        // Continue polling on error (might be temporary network issue)
        // Consider exponential backoff if errors persist
      }
    },
    [handleJobStatusUpdate]
  );

  /**
   * Start polling for all active jobs
   */
  useEffect(() => {
    const jobIds = Array.from(jobs.keys());
    const intervals = intervalsRef.current;

    // Start polling for new jobs
    jobIds.forEach((jobId) => {
      if (!intervals.has(jobId)) {
        console.log("[useUploadWebSocket] Starting polling for job:", jobId);

        // Poll immediately, then every POLL_INTERVAL
        pollJob(jobId);
        const interval = setInterval(() => pollJob(jobId), POLL_INTERVAL);
        intervals.set(jobId, interval);
      }
    });

    // Stop polling for removed jobs
    intervals.forEach((interval, jobId) => {
      if (!jobIds.includes(jobId)) {
        console.log("[useUploadWebSocket] Stopping polling for removed job:", jobId);
        clearInterval(interval);
        intervals.delete(jobId);
      }
    });
  }, [jobs, pollJob]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);
}
