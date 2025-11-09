/**
 * S3 multipart upload utilities
 */

export interface MultipartUploadPart {
  partNumber: number;
  etag: string;
}

export interface PartUploadResult {
  partNumber: number;
  etag: string;
}

const DEFAULT_PART_SIZE = 8 * 1024 * 1024; // 8MB (matches backend default)

/**
 * Upload a single part to S3 using presigned URL
 */
async function uploadPart(
  part: Blob,
  partNumber: number,
  presignedUrl: string,
  onPartProgress?: (loaded: number, total: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onPartProgress) {
        onPartProgress(e.loaded, e.total);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Extract ETag from response headers
        const etag = xhr.getResponseHeader("ETag")?.replace(/"/g, "") || "";
        if (!etag) {
          reject(new Error("No ETag in response"));
          return;
        }
        resolve(etag);
      } else {
        reject(new Error(`Part upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Part upload failed"));
    });

    xhr.open("PUT", presignedUrl);
    xhr.send(part);
  });
}

/**
 * Upload a part with retry logic
 */
async function uploadPartWithRetry(
  part: Blob,
  partNumber: number,
  presignedUrl: string,
  onPartProgress?: (loaded: number, total: number) => void,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await uploadPart(part, partNumber, presignedUrl, onPartProgress);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Part upload failed after retries");
}

/**
 * Split file into chunks for multipart upload
 */
function chunkFile(file: File, partSize: number): Blob[] {
  const chunks: Blob[] = [];
  let offset = 0;
  
  while (offset < file.size) {
    const end = Math.min(offset + partSize, file.size);
    chunks.push(file.slice(offset, end));
    offset = end;
  }
  
  return chunks;
}

/**
 * Upload file using multipart upload
 */
export async function uploadMultipartToS3(
  file: File,
  partUrls: Array<{ partNumber: number; presignedUrl: string }>,
  partSize: number,
  onProgress?: (progress: number) => void
): Promise<MultipartUploadPart[]> {
  // Split file into chunks
  const chunks = chunkFile(file, partSize);
  
  if (chunks.length !== partUrls.length) {
    throw new Error(`Mismatch: ${chunks.length} chunks but ${partUrls.length} part URLs`);
  }
  
  // Sort part URLs by part number
  const sortedPartUrls = [...partUrls].sort((a, b) => a.partNumber - b.partNumber);
  
  const results: MultipartUploadPart[] = [];
  let totalUploaded = 0;
  const totalSize = file.size;
  
  // Upload parts sequentially (can be parallelized later if needed)
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const { partNumber, presignedUrl } = sortedPartUrls[i];
    
    try {
      const etag = await uploadPartWithRetry(
        chunk,
        partNumber,
        presignedUrl,
        (loaded, total) => {
          // Calculate overall progress
          const partProgress = (loaded / total) * 100;
          const partSize = chunk.size;
          const uploadedInPart = (loaded / total) * partSize;
          const overallProgress = ((totalUploaded + uploadedInPart) / totalSize) * 100;
          if (onProgress) {
            onProgress(Math.min(overallProgress, 99)); // Cap at 99% until completion
          }
        }
      );
      
      results.push({ partNumber, etag });
      totalUploaded += chunk.size;
      
      // Update progress
      if (onProgress) {
        const progress = (totalUploaded / totalSize) * 100;
        onProgress(Math.min(progress, 99));
      }
    } catch (error) {
      throw new Error(`Failed to upload part ${partNumber}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Sort results by part number
  results.sort((a, b) => a.partNumber - b.partNumber);
  
  return results;
}

/**
 * Upload file directly to S3 using presigned URL
 * For files ≤ 5MB, use single PUT request
 * For files > 5MB, use multipart upload
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

