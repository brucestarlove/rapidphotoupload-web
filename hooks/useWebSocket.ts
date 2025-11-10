import { useEffect, useRef, useCallback } from "react";
import { webSocketClient, MessageHandler } from "@/lib/websocket/client";
import type { ProgressUpdate, JobStatusUpdate } from "@/types/api";

export interface UseWebSocketOptions {
  jobId: string | null;
  onProgressUpdate?: (update: ProgressUpdate) => void;
  onJobStatusUpdate?: (update: JobStatusUpdate) => void;
  enabled?: boolean;
}

/**
 * React hook for WebSocket subscriptions
 */
export function useWebSocket({
  jobId,
  onProgressUpdate,
  onJobStatusUpdate,
  enabled = true,
}: UseWebSocketOptions) {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const handlersRef = useRef({ onProgressUpdate, onJobStatusUpdate });

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = { onProgressUpdate, onJobStatusUpdate };
  }, [onProgressUpdate, onJobStatusUpdate]);

  // Create message handler
  const handleMessage = useCallback<MessageHandler>((message) => {
    const { onProgressUpdate, onJobStatusUpdate } = handlersRef.current;

    if (message.type === "ProgressUpdate" && onProgressUpdate) {
      onProgressUpdate(message.data as ProgressUpdate);
    } else if (message.type === "JobStatusUpdate" && onJobStatusUpdate) {
      onJobStatusUpdate(message.data as JobStatusUpdate);
    }
  }, []);

  // Connect and subscribe when enabled and jobId is provided
  useEffect(() => {
    if (!enabled || !jobId) {
      return;
    }

    let mounted = true;

    // Connect if not already connected
    const connectAndSubscribe = async () => {
      try {
        if (!webSocketClient.connected) {
          await webSocketClient.connect();
        }

        if (mounted && webSocketClient.connected) {
          // Subscribe to job topic
          const unsubscribe = webSocketClient.subscribeToJob(jobId, handleMessage);
          unsubscribeRef.current = unsubscribe;
        }
      } catch (error) {
        console.error("[useWebSocket] Failed to connect:", error);
      }
    };

    connectAndSubscribe();

    // Cleanup on unmount or when jobId changes
    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [jobId, enabled, handleMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);
}

