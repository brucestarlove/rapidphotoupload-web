"use client";

import { Badge } from "@/components/ui/badge";
import type { PhotoStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
  status: PhotoStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const variantMap: Record<PhotoStatus, "default" | "secondary" | "destructive"> = {
    QUEUED: "secondary",
    UPLOADING: "default",
    PROCESSING: "default",
    COMPLETED: "default",
    FAILED: "destructive",
    CANCELLED: "secondary",
  };

  const colorMap: Record<PhotoStatus, string> = {
    QUEUED: "bg-muted text-muted-foreground",
    UPLOADING: "bg-primary text-primary-foreground",
    PROCESSING: "bg-primary text-primary-foreground",
    COMPLETED: "bg-green-600 text-white",
    FAILED: "bg-destructive text-destructive-foreground",
    CANCELLED: "bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant={variantMap[status]}
      className={cn(
        "text-xs font-medium transition-colors",
        colorMap[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}

