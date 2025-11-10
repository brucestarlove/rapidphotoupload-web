"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PhotoStatus } from "@/types/domain";

interface StatusFilterProps {
  value: PhotoStatus | "ALL" | undefined;
  onChange: (status: PhotoStatus | "ALL" | undefined) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Select
      value={value || "ALL"}
      onValueChange={(val) => onChange(val === "ALL" ? undefined : (val as PhotoStatus))}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Status</SelectItem>
        <SelectItem value="COMPLETED">Completed</SelectItem>
        <SelectItem value="PROCESSING">Processing</SelectItem>
        <SelectItem value="UPLOADING">Uploading</SelectItem>
        <SelectItem value="QUEUED">Queued</SelectItem>
        <SelectItem value="FAILED">Failed</SelectItem>
      </SelectContent>
    </Select>
  );
}

