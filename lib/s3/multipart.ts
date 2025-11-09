/**
 * S3 multipart upload utilities
 * Basic structure for Phase 1 - full implementation in Phase 2
 */

export interface MultipartUploadPart {
  partNumber: number;
  etag: string;
}

/**
 * Upload file directly to S3 using presigned URL
 * For files ≤ 5MB, use single PUT request
 * For files > 5MB, multipart upload will be implemented in Phase 2
 */
export async function uploadToS3(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

