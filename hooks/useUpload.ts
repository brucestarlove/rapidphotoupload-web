import { useCallback } from "react";
import { useUploadStore } from "@/stores/uploadStore";
import { createUploadJob, updateProgress } from "@/lib/api/upload";
import { uploadToS3 } from "@/lib/s3/multipart";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Allowed image file extensions (case-insensitive)
const ALLOWED_EXTENSIONS: readonly string[] = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/**
 * Check if a file is an allowed image type
 */
function isValidImageType(file: File): boolean {
  // Check MIME type first
  const mimeType = file.type.toLowerCase();
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return true;
  }

  // Fallback: check file extension (MIME types can be unreliable)
  const fileName = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

export function useUpload() {
  const { addUpload, updateUpload, removeUpload } = useUploadStore();

  const uploadFiles = useCallback(
    async (files: File[]) => {
      try {
        // Validate files
        const validFiles = files.filter((file) => {
          if (file.size > MAX_FILE_SIZE) {
            toast.error(`File ${file.name} is too large (max 5MB)`);
            return false;
          }
          if (!isValidImageType(file)) {
            toast.error(
              `File ${file.name} is not a supported image type. Allowed types: JPG, JPEG, PNG, GIF, WEBP`
            );
            return false;
          }
          return true;
        });

        if (validFiles.length === 0) return;

        // Create upload job
        const jobData = {
          files: validFiles.map((file) => ({
            filename: file.name,
            mimeType: file.type,
            bytes: file.size,
          })),
          strategy: "s3-presigned" as const,
        };

        const jobResponse = await createUploadJob(jobData);

        // Upload each file
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          const item = jobResponse.items[i];
          const uploadId = `${item.photoId}-${Date.now()}`;

          addUpload(uploadId, file);

          try {
            await uploadToS3(
              file,
              item.presignedUrl,
              (progress) => {
                updateUpload(uploadId, {
                  photoId: item.photoId,
                  status: "UPLOADING",
                  progress,
                });

                // Update progress on backend (best-effort)
                updateProgress({
                  photoId: item.photoId,
                  bytesSent: Math.floor((file.size * progress) / 100),
                  bytesTotal: file.size,
                });
              }
            );

            updateUpload(uploadId, {
              photoId: item.photoId,
              status: "COMPLETED",
              progress: 100,
            });

            toast.success(`Uploaded ${file.name}`);
          } catch (error) {
            updateUpload(uploadId, {
              photoId: item.photoId,
              status: "FAILED",
              error: error instanceof Error ? error.message : "Upload failed",
            });
            toast.error(`Failed to upload ${file.name}`);
          }
        }
      } catch (error) {
        toast.error("Failed to create upload job");
        console.error("Upload error:", error);
      }
    },
    [addUpload, updateUpload]
  );

  return {
    uploadFiles,
  };
}

