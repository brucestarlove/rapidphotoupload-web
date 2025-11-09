"use client";

import { useCallback, useState } from "react";
import { useUpload } from "@/hooks/useUpload";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadZone() {
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
    <Card
      className={cn(
        "border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-border"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <UploadIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Upload Photos</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Drag and drop files here, or click to select files
        </p>
        <label htmlFor="file-upload">
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <span className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Select Files
          </span>
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Maximum file size: 5MB per file
        </p>
      </div>
    </Card>
  );
}

