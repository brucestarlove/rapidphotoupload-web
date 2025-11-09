"use client";

import { useEffect, useCallback, useRef } from "react";
import { useUploadStore } from "@/stores/uploadStore";
import { webSocketClient } from "@/lib/websocket/client";
import { useQueryClient } from "@tanstack/react-query";
import type { ProgressUpdate, JobStatusUpdate } from "@/types/api";

/**
 * Hook to manage WebSocket subscriptions for all active upload jobs
 */
export function useUploadWebSocket() {
  const { jobs, updateFileProgress, updateFileStatus } = useUploadStore();
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  // Handle progress updates from WebSocket
  const handleProgressUpdate = useCallback((update: ProgressUpdate) => {
    updateFileProgress(update.photoId, update.progressPercent);
    updateFileStatus(update.photoId, update.status as any);
  }, [updateFileProgress, updateFileStatus]);

  // Handle job status updates
  const handleJobStatusUpdate = useCallback((update: JobStatusUpdate) => {
    // Invalidate photos query when job completes to refresh the list
    if (update.status === "COMPLETED") {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    }
  }, [queryClient]);

  // Subscribe to all active jobs
  useEffect(() => {
    const jobIds = Array.from(jobs.keys());
    const subscriptions = subscriptionsRef.current;

    // Connect WebSocket if not connected
    const connectAndSubscribe = async () => {
      if (!webSocketClient.connected) {
        try {
          await webSocketClient.connect();
        } catch (error) {
          console.error("[useUploadWebSocket] Failed to connect:", error);
          return;
        }
      }

      // Subscribe to each job
      jobIds.forEach((jobId) => {
        if (!subscriptions.has(jobId)) {
          const unsubscribe = webSocketClient.subscribeToJob(jobId, (message) => {
            if (message.type === "ProgressUpdate") {
              handleProgressUpdate(message.data as ProgressUpdate);
            } else if (message.type === "JobStatusUpdate") {
              handleJobStatusUpdate(message.data as JobStatusUpdate);
            }
          });
          subscriptions.set(jobId, unsubscribe);
        }
      });
    };

    connectAndSubscribe();

    // Cleanup: unsubscribe from removed jobs
    return () => {
      subscriptions.forEach((unsubscribe, jobId) => {
        if (!jobIds.includes(jobId)) {
          unsubscribe();
          subscriptions.delete(jobId);
        }
      });
    };
  }, [jobs, handleProgressUpdate, handleJobStatusUpdate]);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, []);
}

