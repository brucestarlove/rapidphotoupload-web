import { create } from "zustand";
import type { UploadFile, PhotoStatus } from "@/types/domain";

interface JobInfo {
  jobId: string;
  photoIds: Set<string>;
  createdAt: number;
}

interface UploadState {
  // File-level tracking (keyed by photoId)
  uploads: Map<string, UploadFile>;
  // Job-level tracking (jobId → photoIds)
  jobs: Map<string, JobInfo>;
  // Queue management
  isPaused: boolean;
  concurrencyLimit: number;
  activeUploads: Set<string>; // photoIds currently uploading
  
  // File operations
  addUpload: (photoId: string, file: File, jobId?: string) => void;
  updateUpload: (photoId: string, updates: Partial<UploadFile>) => void;
  removeUpload: (photoId: string) => void;
  updateFileProgress: (photoId: string, progress: number) => void;
  updateFileStatus: (photoId: string, status: PhotoStatus) => void;
  
  // Job operations
  addJob: (jobId: string, photoIds: string[]) => void;
  getJobPhotoIds: (jobId: string) => string[];
  getJobUploads: (jobId: string) => UploadFile[];
  
  // Queue operations
  pauseUploads: () => void;
  resumeUploads: () => void;
  cancelUpload: (photoId: string) => void;
  retryUpload: (photoId: string) => void;
  
  // Batch operations
  clearCompleted: () => void;
  clearAll: () => void;
  getActiveUploads: () => UploadFile[];
  getUploadsByStatus: (status: PhotoStatus) => UploadFile[];
  
  // Statistics
  getTotalCount: () => number;
  getCompletedCount: () => number;
  getFailedCount: () => number;
  getOverallProgress: () => number;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: new Map(),
  jobs: new Map(),
  isPaused: false,
  concurrencyLimit: 100,
  activeUploads: new Set(),
  
  addUpload: (photoId, file, jobId) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.set(photoId, {
        file,
        status: "QUEUED",
        progress: 0,
        photoId,
        jobId,
      });
      
      // Track job if provided
      const newJobs = new Map(state.jobs);
      if (jobId) {
        const job = newJobs.get(jobId);
        if (job) {
          job.photoIds.add(photoId);
        } else {
          newJobs.set(jobId, {
            jobId,
            photoIds: new Set([photoId]),
            createdAt: Date.now(),
          });
        }
      }
      
      return { uploads: newUploads, jobs: newJobs };
    });
  },
  
  updateUpload: (photoId, updates) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      const existing = newUploads.get(photoId);
      if (existing) {
        const updated = { ...existing, ...updates };
        newUploads.set(photoId, updated);
        
        // Update active uploads set
        const newActiveUploads = new Set(state.activeUploads);
        if (updated.status === "UPLOADING") {
          newActiveUploads.add(photoId);
        } else {
          newActiveUploads.delete(photoId);
        }
        
        return { uploads: newUploads, activeUploads: newActiveUploads };
      }
      return state;
    });
  },
  
  removeUpload: (photoId) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      const upload = newUploads.get(photoId);
      newUploads.delete(photoId);
      
      // Remove from job tracking
      const newJobs = new Map(state.jobs);
      if (upload?.jobId) {
        const job = newJobs.get(upload.jobId);
        if (job) {
          job.photoIds.delete(photoId);
          if (job.photoIds.size === 0) {
            newJobs.delete(upload.jobId);
          }
        }
      }
      
      // Remove from active uploads
      const newActiveUploads = new Set(state.activeUploads);
      newActiveUploads.delete(photoId);
      
      return { uploads: newUploads, jobs: newJobs, activeUploads: newActiveUploads };
    });
  },
  
  updateFileProgress: (photoId, progress) => {
    get().updateUpload(photoId, { progress });
  },
  
  updateFileStatus: (photoId, status) => {
    get().updateUpload(photoId, { status });
  },
  
  addJob: (jobId, photoIds) => {
    set((state) => {
      const newJobs = new Map(state.jobs);
      newJobs.set(jobId, {
        jobId,
        photoIds: new Set(photoIds),
        createdAt: Date.now(),
      });
      return { jobs: newJobs };
    });
  },
  
  getJobPhotoIds: (jobId) => {
    const state = get();
    const job = state.jobs.get(jobId);
    return job ? Array.from(job.photoIds) : [];
  },
  
  getJobUploads: (jobId) => {
    const state = get();
    const photoIds = state.getJobPhotoIds(jobId);
    return photoIds
      .map((photoId) => state.uploads.get(photoId))
      .filter((upload): upload is UploadFile => upload !== undefined);
  },
  
  pauseUploads: () => {
    set({ isPaused: true });
  },
  
  resumeUploads: () => {
    set({ isPaused: false });
  },
  
  cancelUpload: (photoId) => {
    get().updateUpload(photoId, { status: "CANCELLED" });
    const newActiveUploads = new Set(get().activeUploads);
    newActiveUploads.delete(photoId);
    set({ activeUploads: newActiveUploads });
  },
  
  retryUpload: (photoId) => {
    const upload = get().uploads.get(photoId);
    if (upload) {
      get().updateUpload(photoId, {
        status: "QUEUED",
        progress: 0,
        error: undefined,
      });
    }
  },
  
  clearCompleted: () => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      const newJobs = new Map(state.jobs);
      const newActiveUploads = new Set(state.activeUploads);
      
      for (const [photoId, upload] of newUploads.entries()) {
        if (upload.status === "COMPLETED" || upload.status === "FAILED") {
          newUploads.delete(photoId);
          newActiveUploads.delete(photoId);
          
          // Clean up job tracking
          if (upload.jobId) {
            const job = newJobs.get(upload.jobId);
            if (job) {
              job.photoIds.delete(photoId);
              if (job.photoIds.size === 0) {
                newJobs.delete(upload.jobId);
              }
            }
          }
        }
      }
      
      return { uploads: newUploads, jobs: newJobs, activeUploads: newActiveUploads };
    });
  },
  
  clearAll: () => {
    set({
      uploads: new Map(),
      jobs: new Map(),
      activeUploads: new Set(),
      isPaused: false,
    });
  },
  
  getActiveUploads: () => {
    const state = get();
    return Array.from(state.uploads.values()).filter(
      (upload) => upload.status !== "COMPLETED" && upload.status !== "FAILED" && upload.status !== "CANCELLED"
    );
  },
  
  getUploadsByStatus: (status) => {
    const state = get();
    return Array.from(state.uploads.values()).filter(
      (upload) => upload.status === status
    );
  },
  
  getTotalCount: () => {
    return get().uploads.size;
  },
  
  getCompletedCount: () => {
    return get().getUploadsByStatus("COMPLETED").length;
  },
  
  getFailedCount: () => {
    return get().getUploadsByStatus("FAILED").length;
  },
  
  getOverallProgress: () => {
    const state = get();
    const uploads = Array.from(state.uploads.values());
    if (uploads.length === 0) return 0;
    
    // Simple calculation: (completed + failed) / total * 100
    // This represents how many items are "done" (either completed or failed)
    const completedCount = uploads.filter((u) => u.status === "COMPLETED").length;
    const failedCount = uploads.filter((u) => u.status === "FAILED").length;
    const totalCount = uploads.length;
    
    // Calculate percentage of completed + failed items
    const overallProgress = Math.round(((completedCount + failedCount) / totalCount) * 100);
    
    return overallProgress;
  },
}));

