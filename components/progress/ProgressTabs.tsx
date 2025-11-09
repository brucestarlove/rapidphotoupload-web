"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { PhotoStatus } from "@/types/domain";

export type ProgressTab = "all" | "active" | "completed" | "failed";

interface ProgressTabsProps {
  value: ProgressTab;
  onValueChange: (value: ProgressTab) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    failed: number;
  };
}

export function ProgressTabs({ value, onValueChange, counts }: ProgressTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange as any}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all" className="relative">
          All
          {counts.all > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
              {counts.all}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="active" className="relative">
          Active
          {counts.active > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
              {counts.active}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="completed" className="relative">
          Completed
          {counts.completed > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
              {counts.completed}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="failed" className="relative">
          Failed
          {counts.failed > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
              {counts.failed}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

