"use client";

import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, X } from "lucide-react";

interface UploadActionsProps {
  onClearCompleted?: () => void;
  onClearAll?: () => void;
  onCancel?: (photoId: string) => void;
  onRetry?: (photoId: string) => void;
  showClearCompleted?: boolean;
  showClearAll?: boolean;
}

export function UploadActions({
  onClearCompleted,
  onClearAll,
  showClearCompleted = false,
  showClearAll = false,
}: UploadActionsProps) {
  return (
    <div className="flex items-center gap-2 border-t border-border pt-2">
      {showClearCompleted && onClearCompleted && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCompleted}
          className="text-xs"
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Clear Completed
        </Button>
      )}
      {showClearAll && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-destructive hover:text-destructive"
        >
          <X className="mr-2 h-3 w-3" />
          Clear All
        </Button>
      )}
    </div>
  );
}

