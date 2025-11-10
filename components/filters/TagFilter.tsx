"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTags } from "@/lib/api/tags";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const { data: availableTags = [], isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select onValueChange={handleTagSelect} disabled={isLoading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            {availableTags.length === 0 ? (
              <SelectItem value="no-tags" disabled>
                {isLoading ? "Loading tags..." : "No tags available"}
              </SelectItem>
            ) : (
              availableTags
                .filter((tag) => !selectedTags.includes(tag))
                .map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs">
            Clear
          </Button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-primary/20 text-primary hover:bg-primary/30 px-2 py-1 text-xs"
            >
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="ml-1.5 hover:text-destructive transition-colors"
                aria-label={`Remove filter ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

