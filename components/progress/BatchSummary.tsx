"use client";

import { memo } from "react";
import { Progress } from "@/components/ui/progress";

interface BatchSummaryProps {
  total: number;
  completed: number;
  failed: number;
  overallProgress: number;
}

export const BatchSummary = memo(function BatchSummary({
  total,
  completed,
  failed,
  overallProgress,
}: BatchSummaryProps) {
  const active = total - completed - failed;
  
  return (
    <div className="space-y-2 border-b border-border pb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {active > 0 ? `${active} uploading` : completed > 0 ? "All completed" : "No active uploads"}
        </span>
        <span className="text-muted-foreground">{overallProgress}%</span>
      </div>
      <Progress value={overallProgress} className="h-2" />
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Total: {total}</span>
        <span>Completed: {completed}</span>
        {failed > 0 && <span className="text-destructive">Failed: {failed}</span>}
      </div>
    </div>
  );
});

