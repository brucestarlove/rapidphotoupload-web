"use client";

import { memo } from "react";
import { Progress } from "@/components/ui/progress";
import { JobStatusBadge } from "./JobStatusBadge";
import { formatFileSize } from "@/lib/utils/format";
import { truncate } from "@/lib/utils/format";
import type { UploadFile } from "@/types/domain";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  upload: UploadFile;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const ProgressBar = memo(function ProgressBar({
  upload,
  onCancel,
  onRetry,
}: ProgressBarProps) {
  const progressColor = 
    upload.status === "COMPLETED" ? "bg-green-600" :
    upload.status === "FAILED" ? "bg-destructive" :
    upload.status === "PROCESSING" ? "bg-primary" :
    "bg-primary";

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={upload.file.name}>
            {truncate(upload.file.name, 40)}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(upload.file.size)}</span>
            <span>•</span>
            <span>{Math.round(upload.progress)}%</span>
          </div>
        </div>
        <JobStatusBadge status={upload.status} />
      </div>
      
      <Progress 
        value={upload.progress} 
        className={cn("h-2", progressColor)}
      />
      
      {upload.error && (
        <p className="text-xs text-destructive">{upload.error}</p>
      )}
      
      <div className="flex items-center gap-2">
        {upload.status === "UPLOADING" && onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        )}
        {upload.status === "FAILED" && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-primary hover:text-primary/80"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
});

