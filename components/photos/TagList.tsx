"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagListProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  editable?: boolean;
  className?: string;
}

export const TagList = memo(function TagList({
  tags,
  onRemove,
  editable = false,
  className,
}: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No tags
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="bg-primary/20 text-primary hover:bg-primary/30 px-2 py-1 text-xs"
        >
          {tag}
          {editable && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tag);
              }}
              className="ml-1.5 hover:text-destructive transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
});

