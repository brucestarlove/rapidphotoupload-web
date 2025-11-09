"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useUploadStore } from "@/stores/uploadStore";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { ProgressTabs, type ProgressTab } from "@/components/progress/ProgressTabs";
import { BatchSummary } from "@/components/progress/BatchSummary";
import { UploadActions } from "@/components/progress/UploadActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhotoStatus } from "@/types/domain";

export function UploadProgressPanel() {
  const {
    uploads,
    getActiveUploads,
    getUploadsByStatus,
    getTotalCount,
    getCompletedCount,
    getFailedCount,
    getOverallProgress,
    clearCompleted,
    clearAll,
    cancelUpload,
    retryUpload,
  } = useUploadStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ProgressTab>("all");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Get uploads based on selected tab
  const filteredUploads = useMemo(() => {
    const allUploads = Array.from(uploads.values());
    
    switch (selectedTab) {
      case "active":
        return allUploads.filter(
          (u) => u.status === "QUEUED" || u.status === "UPLOADING" || u.status === "PROCESSING"
        );
      case "completed":
        return getUploadsByStatus("COMPLETED");
      case "failed":
        return getUploadsByStatus("FAILED");
      default:
        return allUploads;
    }
  }, [uploads, selectedTab, getUploadsByStatus]);

  // Calculate counts
  const counts = useMemo(() => {
    const all = getTotalCount();
    const active = getActiveUploads().length;
    const completed = getCompletedCount();
    const failed = getFailedCount();
    return { all, active, completed, failed };
  }, [getTotalCount, getActiveUploads, getCompletedCount, getFailedCount]);

  const overallProgress = getOverallProgress();

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - 400; // panel width
      const maxY = window.innerHeight - (isMinimized ? 60 : 600); // panel height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, isMinimized]);

  // Don't show panel if no uploads
  if (uploads.size === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        "fixed bottom-4 right-4 z-50 w-[400px] shadow-lg transition-all",
        isMinimized ? "h-auto" : "max-h-[600px]"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Header - draggable */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-border p-3",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-semibold">Upload Progress</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Batch Summary */}
          <div className="p-4">
            <BatchSummary
              total={counts.all}
              completed={counts.completed}
              failed={counts.failed}
              overallProgress={overallProgress}
            />
          </div>

          {/* Tabs */}
          <div className="px-4">
            <ProgressTabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              counts={counts}
            />
          </div>

          {/* Upload List */}
          <div className="max-h-[300px] space-y-2 overflow-y-auto p-4">
            {filteredUploads.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {selectedTab === "all" ? "No uploads" : `No ${selectedTab} uploads`}
              </p>
            ) : (
              filteredUploads.map((upload) => (
                upload.photoId && (
                  <ProgressBar
                    key={upload.photoId}
                    upload={upload}
                    onCancel={() => upload.photoId && cancelUpload(upload.photoId)}
                    onRetry={() => upload.photoId && retryUpload(upload.photoId)}
                  />
                )
              ))
            )}
          </div>

          {/* Actions */}
          <div className="p-4">
            <UploadActions
              onClearCompleted={clearCompleted}
              onClearAll={clearAll}
              showClearCompleted={counts.completed > 0}
              showClearAll={counts.all > 0}
            />
          </div>
        </>
      )}
    </Card>
  );
}

