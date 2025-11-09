"use client";

import { useCallback, useState } from "react";
import { useUpload } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";

export function UploadZoneCompact() {
  const { uploadFiles } = useUpload();
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        uploadFiles(Array.from(files));
      }
    },
    [uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  return (
    <tr
      className={cn(
        "border-b border-border transition-colors",
        isDragging ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <td colSpan={4} className="px-4 py-8">
        <div className="flex items-center gap-3">
          <label htmlFor="file-upload-compact" className="cursor-pointer">
            <input
              id="file-upload-compact"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Select Files
            </span>
          </label>
          <div className="flex-1">
            <div className="text-sm font-medium">Upload Images</div>
            <div className="text-xs text-muted-foreground">
              Or drag and drop files here
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
